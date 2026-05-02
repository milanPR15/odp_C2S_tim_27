import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { gamesApi } from "../../api_services/games/GamesAPIService";
import type { GameDto } from "../../models/game/GameTypes";
import { Empty, ErrorBox, PageHeader, Spinner, StatCard } from "../../components/ui/UI";
import { GameCard } from "../../components/game-display/GameCard";
import { useAuth } from "../../hooks/auth/useAuthHook";

export default function GamesCatalogPage() {
  const { user } = useAuth();
  const [games, setGames] = useState<GameDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingIds, setDeletingIds] = useState<number[]>([]);

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
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {sortedGames.map((game) => (
            <GameCard
              key={game.game_id}
              game={game}
              isDeleting={deletingIds.includes(game.game_id)}
              onDelete={async (deletedGame) => {
                const confirmed = window.confirm(`Delete game '${deletedGame.title}'?`);
                if (!confirmed) return;
                setError("");
                setDeletingIds((s) => [...s, deletedGame.game_id]);
                const res = await gamesApi.delete(deletedGame.game_id);
                setDeletingIds((s) => s.filter((id) => id !== deletedGame.game_id));
                if (!res.success) {
                  setError(res.message || "Failed to delete game.");
                  return;
                }
                setGames((prev) => prev.filter((g) => g.game_id !== deletedGame.game_id));
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
