import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { gamesApi } from "../../api_services/games/GamesAPIService";
import { tournamentApi } from "../../api_services/tournament/TournamentAPIService";
import { TournamentFilterDropdown } from "../../components/tournament_display/TournamentFilterDropdown";
import {
  Empty,
  ErrorBox,
  PageHeader,
  Spinner,
  StatCard,
  StatusBadge,
  Table,
  TableHead,
} from "../../components/ui/UI";
import { useAuth } from "../../hooks/auth/useAuthHook";
import type { GameDto } from "../../models/game/GameTypes";
import type { TournamentDto } from "../../models/tournament/TournamentTypes";

type TournamentStatus = TournamentDto["status"];
type TournamentFormat = TournamentDto["format"];

type GameFilter = "all" | `${number}`;
type StatusFilter = "all" | TournamentStatus;
type FormatFilter = "all" | TournamentFormat;

const statusLabels: Record<TournamentStatus, string> = {
  upcoming: "Upcoming",
  ongoing: "Ongoing",
  completed: "Completed",
};

const formatLabels: Record<TournamentFormat, string> = {
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

export default function TournamentsCatalogPage() {
  const { user } = useAuth();

  const [tournaments, setTournaments] = useState<TournamentDto[]>([]);
  const [games, setGames] = useState<GameDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [gameFilter, setGameFilter] = useState<GameFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [formatFilter, setFormatFilter] = useState<FormatFilter>("all");

  useEffect(() => {
    let active = true;

    async function loadData() {
      setIsLoading(true);
      setError("");

      const [tournamentsRes, gamesRes] = await Promise.all([
        tournamentApi.getAll(),
        gamesApi.getAll(),
      ]);

      if (!active) return;

      const nextTournaments = tournamentsRes.success ? (tournamentsRes.data ?? []) : [];
      const nextGames = gamesRes.success ? (gamesRes.data ?? []) : [];

      setTournaments(nextTournaments);
      setGames(nextGames);

      const messages: string[] = [];
      if (!tournamentsRes.success) {
        messages.push(tournamentsRes.message || "Failed to load tournaments.");
      }
      if (!gamesRes.success) {
        messages.push(gamesRes.message || "Failed to load games for tournament filters.");
      }
      setError(messages.join(" "));
      setIsLoading(false);
    }

    loadData();

    return () => {
      active = false;
    };
  }, []);

  const gamesById = useMemo(
    () => new Map(games.map((game) => [game.game_id, game.title])),
    [games],
  );

  const sortedGames = useMemo(
    () => [...games].sort((a, b) => a.title.localeCompare(b.title)),
    [games],
  );

  const filteredTournaments = useMemo(() => {
    return tournaments
      .filter((item) => (gameFilter === "all" ? true : String(item.game_id) === gameFilter))
      .filter((item) => (statusFilter === "all" ? true : item.status === statusFilter))
      .filter((item) => (formatFilter === "all" ? true : item.format === formatFilter))
      .sort((a, b) => {
        const timeDiff = new Date(a.entry_deadline).getTime() - new Date(b.entry_deadline).getTime();
        if (Number.isNaN(timeDiff) || timeDiff === 0) return a.name.localeCompare(b.name);
        return timeDiff;
      });
  }, [formatFilter, gameFilter, statusFilter, tournaments]);

  const totalPrizePool = useMemo(
    () => filteredTournaments.reduce((sum, item) => sum + item.prize_pool, 0),
    [filteredTournaments],
  );

  return (
    <div>
      <PageHeader
        eyebrow="Tournaments"
        title="Tournament Catalog"
        action={user?.role === "admin" ? (
          <Link
            to="/admin/tournaments/create"
            className="inline-flex items-center gap-2 h-10 rounded-xl border border-cyan-300/40 bg-cyan-300/15 px-4 text-xs font-medium uppercase tracking-wider text-cyan-100 transition hover:bg-cyan-300/20"
          >
            Create Tournament
          </Link>
        ) : undefined}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <StatCard label="Total" value={tournaments.length} sub="All tournaments" />
        <StatCard label="Visible" value={filteredTournaments.length} sub="After current filters" />
        <StatCard label="Prize Pool" value={formatMoney(totalPrizePool)} sub="Sum of visible tournaments" />
      </div>

      <section className="rounded-2xl border border-white/10 bg-linear-to-b from-white/10 to-white/5 p-5 shadow-lg shadow-black/20 backdrop-blur-md mb-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <TournamentFilterDropdown<GameFilter>
            label="Filter by Game"
            value={gameFilter}
            onChange={setGameFilter}
            allLabel="All Games"
            options={sortedGames.map((g) => ({ value: String(g.game_id) as GameFilter, label: g.title }))}
          />

          <TournamentFilterDropdown<StatusFilter>
            label="Filter by Status"
            value={statusFilter}
            onChange={setStatusFilter}
            allLabel="All Statuses"
            options={Object.entries(statusLabels).map(([val, label]) => ({ value: val as StatusFilter, label }))}
          />

          <TournamentFilterDropdown<FormatFilter>
            label="Filter by Format"
            value={formatFilter}
            onChange={setFormatFilter}
            allLabel="All Formats"
            options={Object.entries(formatLabels).map(([val, label]) => ({ value: val as FormatFilter, label }))}
          />
        </div>
      </section>

      {error && (
        <div className="mb-4">
          <ErrorBox message={error} />
        </div>
      )}

      {isLoading ? (
        <div className="rounded-2xl border border-white/8 bg-white/3 min-h-56 flex items-center justify-center">
          <Spinner size={22} />
        </div>
      ) : filteredTournaments.length === 0 ? (
        <div className="rounded-2xl border border-white/8 bg-white/3">
          <Empty message={tournaments.length === 0 ? "No tournaments found." : "No tournaments match selected filters."} />
        </div>
      ) : (
        <Table>
          <TableHead columns={["Name", "Game", "Format", "Status", "Teams", "Entry Deadline", "Prize Pool"]} />
          <tbody>
            {filteredTournaments.map((tournament) => (
              <tr key={tournament.tournament_id} className="border-b last:border-b-0 border-white/6">
                <td className="px-5 py-4 text-white/90 font-medium tracking-tight">{tournament.name}</td>
                <td className="px-5 py-4 text-white/70">{gamesById.get(tournament.game_id) ?? `Game #${tournament.game_id}`}</td>
                <td className="px-5 py-4 text-white/70">{formatLabels[tournament.format]}</td>
                <td className="px-5 py-4"><StatusBadge status={tournament.status} /></td>
                <td className="px-5 py-4 text-white/70">{tournament.max_teams}</td>
                <td className="px-5 py-4 text-white/70">{formatDateTime(tournament.entry_deadline)}</td>
                <td className="px-5 py-4 text-white/80">{formatMoney(tournament.prize_pool)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
