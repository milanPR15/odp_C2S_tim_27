import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { gamesApi } from "../../api_services/games/GamesAPIService";
import type { GameDto } from "../../models/game/GameTypes";
import { Empty, ErrorBox, PageHeader, Spinner, StatCard } from "../../components/ui/UI";
import { useAuth } from "../../hooks/auth/useAuthHook";

function formatDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString();
}

export default function GamesCatalogPage() {
  const { user } = useAuth();
  const [games, setGames] = useState<GameDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadGames() {
      setIsLoading(true);
      setError("");

      const res = await gamesApi.getAll();
      if (!active) return;

      if (!res.success) {
        setGames([]);
        setError(res.message || "Failed to load games catalog.");
        setIsLoading(false);
        return;
      }

      setGames(res.data ?? []);
      setIsLoading(false);
    }

    loadGames();

    return () => {
      active = false;
    };
  }, []);

  const sortedGames = useMemo(
    () => [...games].sort((a, b) => a.title.localeCompare(b.title)),
    [games],
  );

  const totalPlayers = useMemo(
    () => sortedGames.reduce((sum, item) => sum + item.max_players, 0),
    [sortedGames],
  );

  return (
    <div>
      <PageHeader
        eyebrow="Games"
        title="Games Catalog"
        action={user?.role === "admin" ? (
          <Link
            to="/admin/games/create"
            className="inline-flex items-center gap-2 h-10 rounded-xl border border-cyan-300/40 bg-cyan-300/15 px-4 text-xs font-medium uppercase tracking-wider text-cyan-100 transition hover:bg-cyan-300/20"
          >
            Create Game
          </Link>
        ) : undefined}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <StatCard label="Total Games" value={sortedGames.length} sub="Loaded from database" />
        <StatCard label="Total Capacity" value={totalPlayers} sub="Sum of max players" />
        <StatCard
          label="Largest Lobby"
          value={sortedGames.length ? Math.max(...sortedGames.map((game) => game.max_players)) : 0}
          sub="Highest max_players value"
        />
      </div>

      {error && (
        <div className="mb-4">
          <ErrorBox message={error} />
        </div>
      )}

      {isLoading ? (
        <div className="rounded-2xl border border-white/8 bg-white/3 min-h-56 flex items-center justify-center">
          <Spinner size={22} />
        </div>
      ) : sortedGames.length === 0 ? (
        <div className="rounded-2xl border border-white/8 bg-white/3">
          <Empty message="No games found in the catalog." />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {sortedGames.map((game) => (
            <article key={game.game_id} className="rounded-2xl border border-white/10 bg-linear-to-b from-white/6 to-white/2 p-4">
              <div className="h-36 w-full rounded-xl border border-white/10 bg-black/25 overflow-hidden flex items-center justify-center">
                <img
                  src={game.logo}
                  alt={`${game.title} logo`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>

              <div className="mt-4">
                <p className="text-white font-medium tracking-tight">{game.title}</p>
                <p className="text-xs text-white/35 mt-1 uppercase tracking-widest">{game.genre}</p>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-white/45 border-t border-white/8 pt-3">
                <span>Max players: {game.max_players}</span>
                <span>Created: {formatDate(game.createdAt)}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
