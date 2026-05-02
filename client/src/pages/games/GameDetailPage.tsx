import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { gamesApi } from "../../api_services/games/GamesAPIService";
import { tournamentApi } from "../../api_services/tournament/TournamentAPIService";
import type { GameDto } from "../../models/game/GameTypes";
import type { TournamentDto } from "../../models/tournament/TournamentTypes";
import { PageHeader, Spinner, ErrorBox, Empty } from "../../components/ui/UI";

function formatDate(value: string | undefined): string {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString();
}

export default function GameDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [game, setGame] = useState<GameDto | null>(null);
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
    <div>
      <div className="mb-6">
        <Link to="/games" className="text-sm text-cyan-400 hover:text-cyan-300 transition hover:underline flex items-center gap-1 w-fit">
          &larr; Back to Catalog
        </Link>
      </div>

      <div className="rounded-2xl border border-white/10 bg-linear-to-b from-white/10 to-white/5 p-6 lg:p-10 shadow-lg shadow-black/20 backdrop-blur-md flex flex-col md:flex-row gap-8 items-start mb-10">
        <div className="w-full md:w-1/3 aspect-square rounded-xl overflow-hidden border border-white/10 bg-black/40 flex shrink-0">
          <img
            src={game.logo}
            alt={`${game.title} logo`}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 w-full space-y-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-cyan-300 mb-2">
              {game.genre}
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">
              {game.title}
            </h1>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-y border-white/10 py-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-white/40 mb-1">Max Players</p>
              <p className="text-xl font-medium text-white">{game.max_players}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-white/40 mb-1">Created At</p>
              <p className="text-xl font-medium text-white">{formatDate(game.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-white/40 mb-1">Last Updated</p>
              <p className="text-xl font-medium text-white">{formatDate(game.updatedAt)}</p>
            </div>
          </div>
        </div>
      </div>

      <PageHeader
        eyebrow="Associated Events"
        title="Tournaments"
      />

      {tournaments.length === 0 ? (
        <div className="rounded-2xl border border-white/8 bg-white/3">
          <Empty message={`No tournaments have been scheduled for ${game.title} yet.`} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {tournaments.map((t) => (
            <article key={t.tournament_id} className="rounded-xl border border-white/10 bg-linear-to-b from-white/5 to-transparent p-5 transition hover:border-white/20">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-bold text-white">{t.name}</h3>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider ${t.status === 'upcoming' ? 'bg-green-500/20 text-green-300 border border-green-500/20' : 'bg-white/10 text-white/60'}`}>
                  {t.status}
                </span>
              </div>
              <div className="space-y-2 text-sm text-white/60 mb-6">
                <div className="flex justify-between border-b border-white/5 pb-2 cursor-default">
                  <span>Format:</span>
                  <span className="text-white capitalize">{t.format.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2 cursor-default">
                  <span>Max Teams:</span>
                  <span className="text-white">{t.max_teams}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2 cursor-default">
                  <span>Prize Pool:</span>
                  <span className="text-yellow-300 font-medium">${Number(t.prize_pool).toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-1 cursor-default">
                  <span>Entry Deadline:</span>
                  <span className="text-white">{formatDate(t.entry_deadline)}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}