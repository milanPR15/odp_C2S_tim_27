import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { matchesApi } from "../../api_services/matches/MatchesAPIService";
import MatchDetailsDialog from "../../components/matches/MatchDetailsDialog";
import { tournamentApi } from "../../api_services/tournament/TournamentAPIService";
import { TournamentTeamRegistrationPanel } from "../../components/tournament_registration/TournamentTeamRegistrationPanel";
import {
  BackButton,
  Empty,
  ErrorBox,
  PageHeader,
  Spinner,
  StatCard,
  StatusBadge,
  Table,
  TableHead,
} from "../../components/ui/UI";
import type { MatchDto } from "../../api_services/matches/IMatchesAPIService";
import type { TournamentDto } from "../../models/tournament/TournamentTypes";
import type { TournamentRegistrationDto } from "../../models/tournament/TournamentTypes";
import { useAuth } from "../../hooks/auth/useAuthHook";

const statusLabels: Record<TournamentDto["status"], string> = {
  upcoming: "Upcoming",
  ongoing: "Ongoing",
  completed: "Completed",
};

const formatLabels: Record<TournamentDto["format"], string> = {
  single_elimination: "Single Elimination",
  double_elimination: "Double Elimination",
  round_robin: "Round Robin",
};

function formatDateTime(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleString();
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

type BracketMatch = MatchDto & {
  next_match_id?: number | null;
  next_match_slot?: "team1" | "team2" | null;
  loser_next_match_id?: number | null;
  loser_next_match_slot?: "team1" | "team2" | null;
  status?: string;
};

type BracketRound = {
  label: string;
  matches: BracketMatch[];
};

type BracketPosition = {
  match: BracketMatch;
  x: number;
  y: number;
  roundIndex: number;
};

type BracketSlot = "team1" | "team2";

function formatTeamId(teamId: number | null): string {
  return teamId === null ? "TBD" : `Team ${teamId}`;
}

function isMatchCompleted(match: BracketMatch): boolean {
  return (match.status ?? (match.result ? "completed" : "scheduled")) === "completed";
}

function getWinnerTeamId(match: BracketMatch): number | null {
  if (!isMatchCompleted(match) || !match.result) {
    return null;
  }

  const [leftScoreRaw, rightScoreRaw] = match.result.split(":");
  const leftScore = Number(leftScoreRaw);
  const rightScore = Number(rightScoreRaw);

  if (Number.isNaN(leftScore) || Number.isNaN(rightScore) || leftScore === rightScore) {
    return null;
  }

  return leftScore > rightScore ? match.team1_id : match.team2_id;
}

function buildIncomingSlotLookup(matches: BracketMatch[]): Map<string, BracketMatch> {
  const lookup = new Map<string, BracketMatch>();

  matches.forEach((match) => {
    if (match.next_match_id && match.next_match_slot) {
      lookup.set(`${match.next_match_id}:${match.next_match_slot}`, match);
    }
  });

  return lookup;
}

function resolveBracketSlotLabel(
  parentMatch: BracketMatch,
  slot: BracketSlot,
  incomingSlotLookup: Map<string, BracketMatch>
): string {
  const sourceMatch = incomingSlotLookup.get(`${parentMatch.match_id}:${slot}`);
  if (!sourceMatch) {
    return formatTeamId(slot === "team1" ? parentMatch.team1_id : parentMatch.team2_id);
  }

  const winnerTeamId = getWinnerTeamId(sourceMatch);
  return winnerTeamId === null ? "TBD" : formatTeamId(winnerTeamId);
}

function buildDepthLookup(matches: BracketMatch[]): Map<number, number> {
  const byId = new Map(matches.map((match) => [match.match_id, match]));
  const depthLookup = new Map<number, number>();

  function resolveDepth(matchId: number): number {
    const cachedDepth = depthLookup.get(matchId);
    if (cachedDepth !== undefined) {
      return cachedDepth;
    }

    const match = byId.get(matchId);
    if (!match || !match.next_match_id) {
      depthLookup.set(matchId, 0);
      return 0;
    }

    const depth = resolveDepth(match.next_match_id) + 1;
    depthLookup.set(matchId, depth);
    return depth;
  }

  matches.forEach((match) => {
    resolveDepth(match.match_id);
  });

  return depthLookup;
}

function groupMatchesIntoRounds(matches: BracketMatch[]): BracketRound[] {
  if (matches.length === 0) {
    return [];
  }

  const depthLookup = buildDepthLookup(matches);
  const grouped = new Map<number, BracketMatch[]>();

  matches.forEach((match) => {
    const depth = depthLookup.get(match.match_id) ?? 0;
    const bucket = grouped.get(depth) ?? [];
    bucket.push(match);
    grouped.set(depth, bucket);
  });

  return [...grouped.entries()]
    .sort(([leftDepth], [rightDepth]) => rightDepth - leftDepth)
    .map(([, roundMatches], index) => ({
      label: `Round ${index + 1}`,
      matches: [...roundMatches].sort((left, right) => left.match_id - right.match_id),
    }));
}

function matchDestination(match: BracketMatch): string | null {
  if (match.next_match_id) {
    return `Winner advances to #${match.next_match_id}`;
  }

  if (match.loser_next_match_id) {
    return `Loser drops to #${match.loser_next_match_id}`;
  }

  return null;
}

function BracketMatchCard({
  match,
  accentClass,
  incomingSlotLookup,
}: {
  match: BracketMatch;
  accentClass: string;
  incomingSlotLookup: Map<string, BracketMatch>;
}) {
  const destination = matchDestination(match);
  const state = match.status ?? (match.result ? "completed" : "scheduled");
  const team1Label = resolveBracketSlotLabel(match, "team1", incomingSlotLookup);
  const team2Label = resolveBracketSlotLabel(match, "team2", incomingSlotLookup);

  return (
    <article className={`rounded-2xl border ${accentClass} bg-white/5 p-4 shadow-lg shadow-black/15`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-white/35">Match</p>
          <p className="mt-1 text-lg font-semibold text-white">#{match.match_id}</p>
        </div>
        <StatusBadge status={state} />
      </div>

      <div className="mt-4 space-y-2">
        <div className="rounded-xl border border-white/8 bg-black/20 px-3 py-2">
          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/30">Team 1</p>
          <p className={`mt-1 text-sm ${team1Label === "TBD" ? "text-white/45 italic" : "text-white/80"}`}>{team1Label}</p>
        </div>
        <div className="rounded-xl border border-white/8 bg-black/20 px-3 py-2">
          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/30">Team 2</p>
          <p className={`mt-1 text-sm ${team2Label === "TBD" ? "text-white/45 italic" : "text-white/80"}`}>{team2Label}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-2 text-xs text-white/45">
        <div className="flex items-center justify-between gap-3 rounded-lg bg-white/3 px-3 py-2">
          <span className="uppercase tracking-[0.16em]">Scheduled</span>
          <span>{formatDateTime(match.scheduled_at)}</span>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-lg bg-white/3 px-3 py-2">
          <span className="uppercase tracking-[0.16em]">Result</span>
          <span className="text-white/75">{match.result ?? "Pending"}</span>
        </div>
        {destination && (
          <div className="rounded-lg border border-white/8 bg-black/15 px-3 py-2 text-white/55">
            {destination}
          </div>
        )}
      </div>
    </article>
  );
}

function buildSingleEliminationLayout(matches: BracketMatch[]): {
  positions: Map<number, BracketPosition>;
  connectors: Array<{ from: number; to: number }>;
  boardWidth: number;
  boardHeight: number;
  roundLabels: string[];
} {
  const depthLookup = buildDepthLookup(matches);
  const maxDepth = Math.max(0, ...depthLookup.values());
  const roundCount = maxDepth + 1;
  const columnGap = 220;
  const rowGap = 78;
  const cardWidth = 180;
  const cardHeight = 52;

  const childrenByParent = new Map<number, BracketMatch[]>();

  matches.forEach((match) => {
    if (!match.next_match_id) {
      return;
    }

    const children = childrenByParent.get(match.next_match_id) ?? [];
    children.push(match);
    childrenByParent.set(match.next_match_id, children);
  });

  const positions = new Map<number, BracketPosition>();
  const connectors: Array<{ from: number; to: number }> = [];
  let leafIndex = 0;

  const sortChildren = (children: BracketMatch[]): BracketMatch[] => [...children].sort((left, right) => {
    if (left.next_match_slot === right.next_match_slot) {
      return left.match_id - right.match_id;
    }

    if (left.next_match_slot === "team1") return -1;
    if (right.next_match_slot === "team1") return 1;
    return left.match_id - right.match_id;
  });

  const placeMatch = (match: BracketMatch): number => {
    const existing = positions.get(match.match_id);
    if (existing) {
      return existing.y;
    }

    const roundIndex = maxDepth - (depthLookup.get(match.match_id) ?? 0);
    const x = roundIndex * columnGap;
    const children = sortChildren(childrenByParent.get(match.match_id) ?? []);

    if (children.length === 0) {
      const y = leafIndex * rowGap;
      leafIndex += 1;
      positions.set(match.match_id, { match, x, y, roundIndex });
      return y;
    }

    const childYs = children.map((child) => placeMatch(child));
    const y = (Math.min(...childYs) + Math.max(...childYs)) / 2;
    positions.set(match.match_id, { match, x, y, roundIndex });

    children.forEach((child) => {
      connectors.push({ from: child.match_id, to: match.match_id });
    });

    return y;
  };

  const roots = matches
    .filter((match) => !match.next_match_id)
    .sort((left, right) => left.match_id - right.match_id);

  roots.forEach((root) => {
    placeMatch(root);
  });

  matches
    .filter((match) => !positions.has(match.match_id))
    .sort((left, right) => left.match_id - right.match_id)
    .forEach((match) => {
      placeMatch(match);
    });

  const boardHeight = Math.max(cardHeight, (Math.max(leafIndex, 1) - 1) * rowGap + cardHeight);
  const boardWidth = roundCount * columnGap + cardWidth;
  const roundLabels = Array.from({ length: roundCount }, (_, index) => `Round ${index + 1}`);

  return { positions, connectors, boardWidth, boardHeight, roundLabels };
}

function SingleEliminationBracket({
  matches,
  onSelectMatch,
  incomingSlotLookup,
}: {
  matches: BracketMatch[];
  onSelectMatch: (matchId: number) => void;
  incomingSlotLookup: Map<string, BracketMatch>;
}) {
  const layout = useMemo(() => buildSingleEliminationLayout(matches), [matches]);

  if (matches.length === 0) {
    return <Empty message="No bracket rounds available yet." />;
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-max rounded-3xl border border-white/10 bg-linear-to-b from-white/10 to-white/5 p-5 text-white shadow-lg shadow-black/20 backdrop-blur-md">
        <div className="mb-5 flex items-center gap-3 border-b border-white/10 pb-3">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-[0.28em] text-white/35">Bracket</p>
            <h3 className="text-sm font-semibold text-white">Single Elimination</h3>
          </div>
          <div className="ml-auto hidden gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-white/35 md:flex">
            {layout.roundLabels.map((label) => (
              <span key={label} className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{label}</span>
            ))}
          </div>
        </div>

        <div className="relative" style={{ width: layout.boardWidth + 80, height: layout.boardHeight + 40 }}>
          <svg
            className="pointer-events-none absolute inset-0"
            width={layout.boardWidth + 80}
            height={layout.boardHeight + 40}
            viewBox={`0 0 ${layout.boardWidth + 80} ${layout.boardHeight + 40}`}
            fill="none"
          >
            <g stroke="rgba(148,163,184,0.35)" strokeWidth="1.5" strokeLinecap="square">
              {layout.connectors.map(({ from, to }, index) => {
                const child = layout.positions.get(from);
                const parent = layout.positions.get(to);
                if (!child || !parent) {
                  return null;
                }

                const childRight = 40 + child.x + 180;
                const childCenterY = 20 + child.y + 26;
                const parentLeft = 40 + parent.x;
                const parentCenterY = 20 + parent.y + 26;
                const elbowX = childRight + 16;

                return (
                  <g key={`${from}-${to}-${index}`}>
                    <line x1={childRight} y1={childCenterY} x2={elbowX} y2={childCenterY} />
                    <line x1={elbowX} y1={childCenterY} x2={elbowX} y2={parentCenterY} />
                    <line x1={elbowX} y1={parentCenterY} x2={parentLeft} y2={parentCenterY} />
                  </g>
                );
              })}
            </g>
          </svg>

          {matches.map((match) => {
            const position = layout.positions.get(match.match_id);
            if (!position) {
              return null;
            }

            return (
              <button
                key={match.match_id}
                type="button"
                onClick={() => onSelectMatch(match.match_id)}
                className="absolute w-45 rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-left shadow-lg shadow-black/20 backdrop-blur-md transition hover:border-cyan-400/30 hover:bg-white/8"
                style={{ left: 40 + position.x, top: 20 + position.y }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/45">Match #{match.match_id}</span>
                  <span className="text-[10px] uppercase tracking-[0.16em] text-cyan-100/80">
                    {match.result ?? (match.status ?? "scheduled")}
                  </span>
                </div>
                <div className="mt-2 space-y-1 text-xs text-white/75">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-white/35">T1</span>
                    <span className="truncate">{resolveBracketSlotLabel(match, "team1", incomingSlotLookup)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-white/35">T2</span>
                    <span className="truncate">{resolveBracketSlotLabel(match, "team2", incomingSlotLookup)}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function TournamentDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [tournament, setTournament] = useState<TournamentDto | null>(null);
  const [matches, setMatches] = useState<BracketMatch[]>([]);
  const [registrationCount, setRegistrationCount] = useState<number | null>(null);
  const [registrations, setRegistrations] = useState<TournamentRegistrationDto[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirmingId, setIsConfirmingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const fetchTournamentData = useCallback(async () => {
    if (!id) {
      return { error: "Tournament ID missing." };
    }

    const tournamentId = Number(id);
    if (Number.isNaN(tournamentId)) {
      return { error: "Invalid tournament ID." };
    }

    const [tournamentRes, matchesRes] = await Promise.all([
      tournamentApi.getById(tournamentId),
      matchesApi.getMatchesByTournament(tournamentId),
    ]);

    if (!tournamentRes.success || !tournamentRes.data) {
      return { error: tournamentRes.message || "Failed to load tournament details." };
    }

    const registrationCountRes = await tournamentApi.getRegistrationCount(tournamentId);
    const registrationsRes = isAdmin ? await tournamentApi.getRegistrations(tournamentId) : null;

    return {
      tournament: tournamentRes.data,
      matches: matchesRes.success ? (matchesRes.data ?? []) : [],
      registrationCount: registrationCountRes.success ? (registrationCountRes.data ?? 0) : null,
      registrations: registrationsRes?.success ? (registrationsRes.data ?? []) : [],
      error: matchesRes.success ? "" : (matchesRes.message || "Tournament loaded, but matches failed to load."),
    };
  }, [id, isAdmin]);

  useEffect(() => {
    let active = true;

    async function loadPageData() {
      setIsLoading(true);
      setError("");
      const result = await fetchTournamentData();

      if (!active) return;

      if (result.error) {
        setError(result.error);
      }

      if (result.tournament) {
        setTournament(result.tournament);
      }
      setMatches(result.matches ?? []);
      setRegistrationCount(result.registrationCount ?? null);
      setRegistrations(result.registrations ?? []);

      setIsLoading(false);
    }

    void loadPageData();

    return () => {
      active = false;
    };
  }, [fetchTournamentData]);

  async function confirmRegistration(registrationId: number) {
    if (!tournament) return;

    setError("");
    setIsConfirmingId(registrationId);

    const res = await tournamentApi.confirmRegistration(tournament.tournament_id, registrationId);
    setIsConfirmingId(null);

    if (!res.success) {
      setError(res.message || "Failed to confirm registration.");
      return;
    }

    const result = await fetchTournamentData();
    if (result.error) {
      setError(result.error);
    }
    if (result.tournament) {
      setTournament(result.tournament);
    }
    setMatches(result.matches ?? []);
    setRegistrationCount(result.registrationCount ?? null);
    setRegistrations(result.registrations ?? []);
  }

  const sortedMatches = useMemo(
    () => [...matches].sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()),
    [matches],
  );

  const roundRobinMatches = useMemo(() => sortedMatches, [sortedMatches]);
  const incomingSlotLookup = useMemo(() => buildIncomingSlotLookup(matches), [matches]);

  const doubleEliminationView = useMemo(() => {
    const grandFinal = sortedMatches.find((match) => !match.next_match_id && !match.loser_next_match_id) ?? null;
    const winnersMatches = sortedMatches.filter((match) => match.loser_next_match_id !== null);
    const losersMatches = sortedMatches.filter(
      (match) => match.match_id !== grandFinal?.match_id && match.loser_next_match_id === null && match.next_match_id !== null,
    );

    return {
      winnersRounds: groupMatchesIntoRounds(winnersMatches),
      losersRounds: groupMatchesIntoRounds(losersMatches),
      grandFinal,
    };
  }, [sortedMatches]);

  function renderBracketRounds(rounds: BracketRound[], accentClass: string) {
    if (rounds.length === 0) {
      return <Empty message="No bracket rounds available yet." />;
    }

    return (
      <div className="overflow-x-auto pb-2">
        <div className="grid gap-4 min-w-max" style={{ gridTemplateColumns: `repeat(${rounds.length}, minmax(18rem, 1fr))` }}>
          {rounds.map((round) => (
            <div key={round.label} className="space-y-4">
              <div className="rounded-xl border border-white/8 bg-white/4 px-4 py-3">
                <p className="text-[11px] font-mono uppercase tracking-[0.24em] text-white/30">{round.label}</p>
                <p className="mt-1 text-sm text-white/70">{round.matches.length} match{round.matches.length === 1 ? "" : "es"}</p>
              </div>
              <div className="space-y-4">
                {round.matches.map((match) => (
                  <BracketMatchCard key={match.match_id} match={match} accentClass={accentClass} incomingSlotLookup={incomingSlotLookup} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderRoundRobinTable() {
    return (
      <Table>
        <TableHead columns={["Match ID", "Team 1", "Team 2", "Scheduled", "Result"]} />
        <tbody>
          {roundRobinMatches.map((match) => (
            <tr
              key={match.match_id}
              className="border-b last:border-b-0 border-white/6 hover:bg-white/3 transition-colors cursor-pointer"
              role="button"
              tabIndex={0}
              onClick={() => setSelectedMatchId(match.match_id)}
              onKeyDown={(e) => { if (e.key === 'Enter') setSelectedMatchId(match.match_id); }}
            >
              <td className="px-5 py-4 text-white/85 font-medium">#{match.match_id}</td>
              <td className="px-5 py-4 text-white/70">{formatTeamId(match.team1_id)}</td>
              <td className="px-5 py-4 text-white/70">{formatTeamId(match.team2_id)}</td>
              <td className="px-5 py-4 text-white/70">{formatDateTime(match.scheduled_at)}</td>
              <td className="px-5 py-4 text-white/80">{match.result ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <Spinner size={32} />
        <p className="text-sm text-white/40 font-mono tracking-widest uppercase">Loading tournament...</p>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div>
        <div className="mb-8">
          <BackButton fallbackTo="/tournaments" />
        </div>
        <ErrorBox message={error || "Tournament not found."} />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <BackButton fallbackTo="/tournaments" />
      </div>

      <PageHeader
        eyebrow="Tournaments"
        title={tournament.name}
      />

      {error && (
        <div className="mb-4">
          <ErrorBox message={error} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard label="Format" value={formatLabels[tournament.format]} sub="Competition structure" />
        <StatCard label="Status" value={statusLabels[tournament.status]} sub="Current tournament phase" />
        <StatCard label="Max Teams" value={tournament.max_teams} sub="Bracket capacity" />
        <StatCard label="Prize Pool" value={formatMoney(tournament.prize_pool)} sub="Total prize fund" />
      </div>

      <div className="mb-4">
        <StatusBadge status={tournament.status} />
      </div>

      <section className="rounded-2xl border border-white/10 bg-linear-to-b from-white/10 to-white/5 p-5 shadow-lg shadow-black/20 backdrop-blur-md mb-8">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs text-white/35 font-mono uppercase tracking-wider mb-1">Entry Deadline</p>
            <p className="text-sm text-white/80">{formatDateTime(tournament.entry_deadline)}</p>
          </div>
          <div>
            <p className="text-xs text-white/35 font-mono uppercase tracking-wider mb-1">Tournament ID</p>
            <p className="text-sm text-white/80">#{tournament.tournament_id}</p>
          </div>
        </div>
      </section>

      {registrationCount === null || registrationCount < tournament.max_teams ? (
        <TournamentTeamRegistrationPanel tournament={tournament} />
      ) : (
        <div className="mb-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          This tournament is full. Team registration is closed.
        </div>
      )}

      {isAdmin && (
        <section className="mb-8 rounded-2xl border border-white/10 bg-linear-to-b from-white/10 to-white/5 p-5 shadow-lg shadow-black/20 backdrop-blur-md">
          <PageHeader eyebrow="Admin" title="Tournament Registrations" />

          {registrations.length === 0 ? (
            <div className="rounded-xl border border-white/8 bg-white/3">
              <Empty message="No registrations found for this tournament." />
            </div>
          ) : (
            <Table>
              <TableHead columns={["Registration ID", "Team", "Status", "Registered", "Action"]} />
              <tbody>
                {registrations.map((registration) => (
                  <tr key={registration.id} className="border-b last:border-b-0 border-white/6">
                    <td className="px-5 py-4 text-white/85 font-medium">#{registration.id}</td>
                    <td className="px-5 py-4 text-white/70">{registration.team_name} (#{registration.team_id})</td>
                    <td className="px-5 py-4 text-white/70">{registration.status}</td>
                    <td className="px-5 py-4 text-white/70">{formatDateTime(registration.registered_at)}</td>
                    <td className="px-5 py-4 text-white/80">
                      {registration.status === "pending" ? (
                        <button
                          type="button"
                          onClick={() => void confirmRegistration(registration.id)}
                          disabled={isConfirmingId === registration.id}
                          className="rounded-lg border border-cyan-300/40 bg-cyan-300/15 px-3 py-2 text-xs font-medium text-cyan-100 transition hover:bg-cyan-300/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isConfirmingId === registration.id ? "Confirming..." : "Confirm"}
                        </button>
                      ) : (
                        <span className="text-xs text-white/35">Confirmed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </section>
      )}

      <PageHeader eyebrow="Schedule" title="Matches" />

      {sortedMatches.length === 0 ? (
        <div className="rounded-2xl border border-white/8 bg-white/3">
          <Empty message="No matches found for this tournament." />
        </div>
      ) : tournament.format === "round_robin" ? (
        renderRoundRobinTable()
      ) : tournament.format === "single_elimination" ? (
        <section className="rounded-2xl border border-white/10 bg-linear-to-b from-white/10 to-white/5 p-5 shadow-lg shadow-black/20 backdrop-blur-md">
          <PageHeader eyebrow="Bracket" title="Single Elimination" />
          <SingleEliminationBracket matches={sortedMatches} onSelectMatch={setSelectedMatchId} incomingSlotLookup={incomingSlotLookup} />
        </section>
      ) : (
        <section className="rounded-2xl border border-white/10 bg-linear-to-b from-white/10 to-white/5 p-5 shadow-lg shadow-black/20 backdrop-blur-md space-y-8">
          <PageHeader eyebrow="Bracket" title="Double Elimination" />

          <div>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-mono uppercase tracking-[0.22em] text-white/30">Winners Bracket</p>
                <p className="text-sm text-white/55">Main path to the grand final</p>
              </div>
            </div>
            {renderBracketRounds(doubleEliminationView.winnersRounds, "border-cyan-400/20 bg-cyan-400/8")}
          </div>

          <div>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-mono uppercase tracking-[0.22em] text-white/30">Losers Bracket</p>
                <p className="text-sm text-white/55">Second chance path</p>
              </div>
            </div>
            {renderBracketRounds(doubleEliminationView.losersRounds, "border-fuchsia-400/20 bg-fuchsia-400/8")}
          </div>

          {doubleEliminationView.grandFinal && (
            <div>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-mono uppercase tracking-[0.22em] text-white/30">Grand Final</p>
                  <p className="text-sm text-white/55">Title match</p>
                </div>
              </div>
              <div className="max-w-xl">
                <BracketMatchCard match={doubleEliminationView.grandFinal} accentClass="border-amber-400/20 bg-amber-400/8" incomingSlotLookup={incomingSlotLookup} />
              </div>
            </div>
          )}
        </section>
      )}

      <MatchDetailsDialog
        matchId={selectedMatchId}
        isOpen={selectedMatchId !== null}
        onClose={() => setSelectedMatchId(null)}
      />
    </div>
  );
}
