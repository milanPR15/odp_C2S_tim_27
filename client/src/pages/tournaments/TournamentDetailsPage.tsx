import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { matchesApi } from "../../api_services/matches/MatchesAPIService";
import MatchDetailsDialog from "../../components/matches/MatchDetailsDialog";
import { tournamentApi } from "../../api_services/tournament/TournamentAPIService";
import { watchlistApi } from "../../api_services/watchlist/WatchlistAPIService";
import { TournamentTeamRegistrationPanel } from "../../components/tournament_registration/TournamentTeamRegistrationPanel";
import {
  BackButton,
  Empty,
  ErrorBox,
  PageHeader,
  Spinner,
  StatCard,
  StatusBadge,
} from "../../components/ui/UI";
import type { TournamentDto } from "../../models/tournament/TournamentTypes";
import type { TournamentRegistrationDto } from "../../models/tournament/TournamentTypes";
import { useAuth } from "../../hooks/auth/useAuthHook";
import BracketMatchCard from "./components/BracketMatchCard";
import SingleEliminationBracket from "./components/SingleEliminationBracket";
import RoundRobinTable from "./components/RoundRobinTable";
import AdminRegistrationsPanel from "./components/AdminRegistrationsPanel";
import {
  formatDateTime,
  formatMoney,
  buildIncomingSlotLookup,
  groupMatchesIntoRounds,
} from "./components/tournamentUtils";
import type { BracketMatch, BracketRound } from "./components/tournamentUtils";

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

const EMPTY_TOURNAMENT: TournamentDto = {
  tournament_id: 0,
  name: "",
  game_id: 0,
  format: "single_elimination",
  max_teams: 0,
  entry_deadline: "",
  prize_pool: 0,
  status: "upcoming",
  createdAt: "",
  updatedAt: "",
};

export default function TournamentDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const canRegisterTeam = !!user;

  const [tournament, setTournament] = useState<TournamentDto>(EMPTY_TOURNAMENT);
  const [matches, setMatches] = useState<BracketMatch[]>([]);
  const [registrationCount, setRegistrationCount] = useState<number>(0);
  const [registrations, setRegistrations] = useState<TournamentRegistrationDto[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirmingId, setIsConfirmingId] = useState<number>(0);
  const [isWatching, setIsWatching] = useState(false);
  const [isWatchlistBusy, setIsWatchlistBusy] = useState(false);
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
    const registrationsRes = user ? await tournamentApi.getRegistrations(tournamentId) : { success: true, message: "", data: [] as TournamentRegistrationDto[] };

    return {
      tournament: tournamentRes.data,
      matches: matchesRes.success ? (matchesRes.data ?? []) : [],
      registrationCount: registrationCountRes.success ? (registrationCountRes.data ?? 0) : 0,
      registrations: registrationsRes.success ? (registrationsRes.data ?? []) : [],
      error: matchesRes.success ? "" : (matchesRes.message || "Tournament loaded, but matches failed to load."),
    };
  }, [id, user]);

  const loadPageData = useCallback(async () => {
    setIsLoading(true);
    setError("");
    const result = await fetchTournamentData();

    if (result.error) {
      setError(result.error);
    }

    setTournament(result.tournament ?? EMPTY_TOURNAMENT);
    setMatches(result.matches ?? []);
    setRegistrationCount(result.registrationCount ?? 0);
    setRegistrations(result.registrations ?? []);

    setIsLoading(false);
  }, [fetchTournamentData]);

  useEffect(() => {
    let active = true;

    async function loadInitialPageData() {
      setIsLoading(true);
      setError("");
      const result = await fetchTournamentData();

      if (!active) return;

      if (result.error) {
        setError(result.error);
      }

      setTournament(result.tournament ?? EMPTY_TOURNAMENT);
      setMatches(result.matches ?? []);
      setRegistrationCount(result.registrationCount ?? 0);
      setRegistrations(result.registrations ?? []);

      setIsLoading(false);
    }

    void loadInitialPageData();

    return () => {
      active = false;
    };
  }, [fetchTournamentData]);

  useEffect(() => {
    let active = true;

    async function loadWatchlistState() {
      if (!id) return;

      const tournamentId = Number(id);
      if (Number.isNaN(tournamentId)) return;

      const res = await watchlistApi.getMine();
      if (!active) return;

      if (res.success) {
        setIsWatching((res.data ?? []).some((item) => item.tournament_id === tournamentId));
      }
    }

    void loadWatchlistState();

    return () => {
      active = false;
    };
  }, [id]);

  async function toggleWatchlist() {
    if (tournament.tournament_id === 0) return;

    setIsWatchlistBusy(true);
    setError("");

    const res = isWatching
      ? await watchlistApi.unfollow(tournament.tournament_id)
      : await watchlistApi.follow(tournament.tournament_id);

    setIsWatchlistBusy(false);

    if (!res.success) {
      setError(res.message || "Failed to update your watchlist.");
      return;
    }

    setIsWatching(!isWatching);
  }

  async function confirmRegistration(registrationId: number) {
    if (tournament.tournament_id === 0) return;

    setError("");
    setIsConfirmingId(registrationId);

    const res = await tournamentApi.confirmRegistration(tournament.tournament_id, registrationId);
    setIsConfirmingId(0);

    if (!res.success) {
      setError(res.message || "Failed to confirm registration.");
      return;
    }

    await loadPageData();
  }

  const sortedMatches = useMemo(
    () => [...matches].sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()),
    [matches],
  );

  const roundRobinMatches = useMemo(() => sortedMatches, [sortedMatches]);
  const incomingSlotLookup = useMemo(() => buildIncomingSlotLookup(matches), [matches]);

  const doubleEliminationView = useMemo(() => {
    const EMPTY_MATCH: BracketMatch = {
      match_id: 0,
      tournament_id: 0,
      team1_id: 0,
      team2_id: 0,
      scheduled_at: "",
      result: "",
      next_match_id: 0,
      next_match_slot: "",
      loser_next_match_id: 0,
      loser_next_match_slot: "",
      status: "scheduled",
    };

    const grandFinal = sortedMatches.find((match) => !match.next_match_id && !match.loser_next_match_id) ?? EMPTY_MATCH;
    const winnersMatches = sortedMatches.filter((match) => match.loser_next_match_id !== 0);
    const losersMatches = sortedMatches.filter(
      (match) => match.match_id !== grandFinal.match_id && match.loser_next_match_id === 0 && match.next_match_id !== 0,
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



  if (isLoading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <Spinner size={32} />
        <p className="text-sm text-white/40 font-mono tracking-widest uppercase">Loading tournament...</p>
      </div>
    );
  }

  if (tournament.tournament_id === 0) {
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
        action={user ? (
          <button
            type="button"
            onClick={() => void toggleWatchlist()}
            disabled={isWatchlistBusy}
            className={`inline-flex items-center gap-2 h-10 rounded-xl border px-4 text-xs font-medium uppercase tracking-wider transition disabled:opacity-60 ${
              isWatching
                ? "border-white/12 bg-white/6 text-white/80 hover:bg-white/10"
                : "border-cyan-300/40 bg-cyan-300/15 text-cyan-100 hover:bg-cyan-300/20"
            }`}
          >
            {isWatching ? "Unfollow" : "Follow"}
          </button>
        ) : undefined}
      />

      {error && (
        <div className="mb-4">
          <ErrorBox message={error} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard label="Format" value={formatLabels[tournament.format] ?? tournament.format} sub="Competition structure" />
        <StatCard label="Status" value={statusLabels[tournament.status] ?? tournament.status} sub="Current tournament phase" />
        <StatCard label="Max Teams" value={tournament.max_teams ?? "-"} sub="Bracket capacity" />
        <StatCard label="Prize Pool" value={formatMoney(Number(tournament.prize_pool ?? 0))} sub="Total prize fund" />
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

      {canRegisterTeam ? (
        registrationCount < tournament.max_teams ? (
          <TournamentTeamRegistrationPanel tournament={tournament} onRegistered={loadPageData} />
        ) : (
          <div className="mb-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            This tournament is full. Team registration is closed.
          </div>
        )
      ) : (
        <div className="mb-8 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">
          Log in to register one of your teams for this tournament.
        </div>
      )}

      {isAdmin && (
        <section className="mb-8 rounded-2xl border border-white/10 bg-linear-to-b from-white/10 to-white/5 p-5 shadow-lg shadow-black/20 backdrop-blur-md">
          <PageHeader eyebrow="Admin" title="Tournament Registrations" />

          <AdminRegistrationsPanel registrations={registrations} isConfirmingId={isConfirmingId} onConfirm={confirmRegistration} />
        </section>
      )}

      {!isAdmin && user && (
        <section className="mb-8 rounded-2xl border border-white/10 bg-linear-to-b from-white/10 to-white/5 p-5 shadow-lg shadow-black/20 backdrop-blur-md">
          <PageHeader eyebrow="Registrations" title="Registered Teams" />

          {registrations.length === 0 ? (
            <div className="rounded-xl border border-white/8 bg-white/3">
              <Empty message="No teams have registered for this tournament yet." />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {registrations.map((registration) => (
                <div key={registration.id} className="rounded-xl border border-white/8 bg-white/3 px-4 py-4">
                  <p className="text-sm font-semibold text-white">{registration.team_name || `Team #${registration.team_id}`}</p>
                  <p className="mt-1 text-xs uppercase tracking-widest text-white/35">Team #{registration.team_id}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <PageHeader eyebrow="Schedule" title="Matches" />

      {sortedMatches.length === 0 ? (
        <div className="rounded-2xl border border-white/8 bg-white/3">
          <Empty message="No matches found for this tournament." />
        </div>
      ) : tournament.format === "round_robin" ? (
        <RoundRobinTable matches={roundRobinMatches} onSelectMatch={setSelectedMatchId} />
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

          {doubleEliminationView.grandFinal.match_id !== 0 && (
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
        isOpen={selectedMatchId !== 0}
        onClose={() => setSelectedMatchId(0)}
      />
    </div>
  );
}
