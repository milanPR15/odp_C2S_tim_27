import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { gamesApi } from "../../api_services/games/GamesAPIService";
import { tournamentApi } from "../../api_services/tournament/TournamentAPIService";
import type { GameDto } from "../../models/game/GameTypes";
import type { TournamentDto } from "../../models/tournament/TournamentTypes";
import { PageHeader, Spinner, ErrorBox, Empty } from "../../components/ui/UI";
import { GameEditForm } from "../../components/game_create/GameEditForm";
import { useAuth } from "../../hooks/auth/useAuthHook";

function formatDate(value: string | undefined): string {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString();
}

export default function GameDetailPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const { id } = useParams<{ id: string }>();
  const [game, setGame] = useState<GameDto>({} as GameDto);
  const [editing, setEditing] = useState(false);
  const [tournaments, setTournaments] = useState<TournamentDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadData() {
      if (!id) return;
      setIsLoading(true);
      setError("");

      const parsedId = parseInt(id, 10);
      if (isNaN(parsedId)) {
        setError("Invalid game ID.");
        setIsLoading(false);
        return;
      }

      const [gameRes, tourneysRes] = await Promise.all([
        gamesApi.getById(parsedId),
        tournamentApi.getByGameId(parsedId)
      ]);

      if (!active) return;

      if (!gameRes.success || !gameRes.data) {
        setError(gameRes.message || "Failed to load game details.");
        setIsLoading(false);
        return;
      }

      setGame(gameRes.data);

      if (tourneysRes.success && tourneysRes.data) {
        setTournaments(tourneysRes.data);
      }

      setIsLoading(false);
    }

    loadData();

    return () => {
      active = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size={32} />
      </div>
    );
  }

  if (error || !game) {
    return (
      <div>
        <PageHeader eyebrow="Games" title="Game Not Found" />
        <ErrorBox message={error || "Game could not be found."} />
        <div className="mt-4">
          <Link to="/games" className="text-cyan-400 hover:text-cyan-300 transition hover:underline">
            &larr; Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Link to="/games" className="text-sm text-cyan-400 hover:text-cyan-300 transition hover:underline flex items-center gap-2">
          &larr; Back to Catalog
        </Link>
        <div className="text-sm text-white/60">{game.title}</div>
      </div>

      <section className="rounded-2xl border border-white/8 bg-linear-to-b from-white/5 to-white/2 p-6 lg:p-8 shadow-md backdrop-blur-sm flex flex-col md:flex-row gap-6 items-start">
        <div className="w-full md:w-1/3 aspect-4/3 rounded-xl overflow-hidden border border-white/6 bg-black/40 flex shrink-0">
          <img
            src={game.logo}
            alt={`${game.title} logo`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        <div className="flex-1 w-full">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-cyan-300 mb-1">{game.genre}</div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-white">{game.title}</h1>
            </div>

            {isAdmin && !editing && (
              <div>
                <button
                  onClick={() => { setEditing(true); setGame((prev) =>({ ...prev, updatedAt: new Date().toISOString() } as GameDto)); }}
                  className="inline-flex items-center gap-2 h-10 rounded-xl border border-white/10 bg-white/4 px-4 text-sm font-medium text-white/90 hover:bg-white/6 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  aria-label="Edit game"
                >
                  Edit
                </button>
              </div>
            )}
          </div>

          {editing && game && (
            <div className="mt-4">
              <GameEditForm game={game} onSaved={(g) => { setGame(g); setEditing(false); }} onCancel={() => setEditing(false)} />
            </div>
          )}

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-widest text-white/40">Max Players</p>
              <p className="text-lg font-semibold text-white">{game.max_players}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-widest text-white/40">Created</p>
              <p className="text-lg font-semibold text-white">{formatDate(game.createdAt)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-widest text-white/40">Updated</p>
              <p className="text-lg font-semibold text-white">{formatDate(game.updatedAt)}</p>
            </div>
          </div>
        </div>
      </section>

      <PageHeader eyebrow="Associated Events" title="Tournaments" />

      {tournaments.length === 0 ? (
        <div className="rounded-2xl border border-white/8 bg-white/3 p-6">
          <Empty message={`No tournaments have been scheduled for ${game.title} yet.`} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {tournaments.map((t) => (
            <article key={t.tournament_id} className="group rounded-xl border border-white/8 bg-linear-to-br from-white/3 to-transparent p-5 transition-transform transform hover:-translate-y-1 hover:shadow-lg">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-bold text-white">{t.name}</h3>
                <span className={`text-xs font-semibold px-2 py-1 rounded uppercase tracking-wider ${t.status === 'upcoming' ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-600/10' : 'bg-white/8 text-white/60'}`}>
                  {t.status}
                </span>
              </div>

              <div className="space-y-2 text-sm text-white/60 mb-4">
                <div className="flex justify-between">
                  <span>Format</span>
                  <span className="text-white capitalize">{t.format.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Max Teams</span>
                  <span className="text-white">{t.max_teams}</span>
                </div>
                <div className="flex justify-between">
                  <span>Prize</span>
                  <span className="text-yellow-300 font-medium">${Number(t.prize_pool).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Entry Deadline</span>
                  <span className="text-white">{formatDate(t.entry_deadline)}</span>
                </div>
              </div>

              <div className="mt-2">
                <Link to={`/tournaments/${t.tournament_id}`} className="inline-block text-sm text-cyan-300 hover:underline">View details</Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}