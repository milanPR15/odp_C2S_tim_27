import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { matchesApi } from "../../api_services/matches/MatchesAPIService";
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

export default function TournamentDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [tournament, setTournament] = useState<TournamentDto | null>(null);
  const [matches, setMatches] = useState<MatchDto[]>([]);
  const [registrationCount, setRegistrationCount] = useState<number | null>(null);
  const [registrations, setRegistrations] = useState<TournamentRegistrationDto[]>([]);
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
      ) : (
        <Table>
          <TableHead columns={["Match ID", "Team 1", "Team 2", "Scheduled", "Result"]} />
          <tbody>
            {sortedMatches.map((match) => (
              <tr key={match.match_id} className="border-b last:border-b-0 border-white/6">
                <td className="px-5 py-4 text-white/85 font-medium">#{match.match_id}</td>
                <td className="px-5 py-4 text-white/70">{match.team1_id ?? "TBD"}</td>
                <td className="px-5 py-4 text-white/70">{match.team2_id ?? "TBD"}</td>
                <td className="px-5 py-4 text-white/70">{formatDateTime(match.scheduled_at)}</td>
                <td className="px-5 py-4 text-white/80">{match.result ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
