import { Spinner } from "../ui/UI";
import { useAuth } from "../../hooks/auth/useAuthHook";
import type { GameDto } from "../../models/game/GameTypes";
import { Link } from "react-router-dom";

function formatDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString();
}

type GameCardProps = {
  game: GameDto;
  isDeleting: boolean;
  onDelete: (game: GameDto) => void;
};

export function GameCard({ game, isDeleting, onDelete }: GameCardProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  return (
    <article className="group relative rounded-2xl border border-white/10 bg-linear-to-b from-white/10 to-white/5 p-5 shadow-lg shadow-black/20 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/30 hover:shadow-xl hover:shadow-cyan-900/20 flex flex-col h-full">
      <Link to={`/games/${game.game_id}`} className="absolute inset-0 z-10" aria-label={`View ${game.title} details`} />
      <div className="relative h-44 w-full rounded-xl border border-white/10 bg-black/40 overflow-hidden">
        <img
          src={game.logo}
          alt={`${game.title} logo`}
          className="h-full w-full object-cover opacity-85 transition-opacity duration-300 group-hover:opacity-100"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 rounded-md bg-black/60 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-300 backdrop-blur-md border border-cyan-500/20">
          {game.genre}
        </div>
      </div>

      <div className="mt-5 grow">
        <h3 className="text-lg font-bold tracking-tight text-white group-hover:text-cyan-50 transition-colors">
          {game.title}
        </h3>
        
        <div className="mt-4 flex flex-col gap-2 text-sm text-white/50">
          <div className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2 border border-white/5">
            <span className="font-medium">Capacity</span>
            <span className="text-cyan-100 bg-cyan-500/20 px-2 py-0.5 rounded-md font-semibold text-xs border border-cyan-500/20">
              {game.max_players} Players
            </span>
          </div>
          <div className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2 border border-white/5">
            <span className="font-medium">Added</span>
            <span className="text-white/70 text-xs">
              {formatDate(game.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="mt-5 pt-4 border-t border-white/10 relative z-20">
          <button
            onClick={() => onDelete(game)}
            disabled={isDeleting}
            className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-xl border border-red-500/30 bg-red-500/10 px-4 text-xs font-bold uppercase tracking-widest text-red-200 transition-all duration-300 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <>
                <Spinner size={16} />
                <span>Deleting...</span>
              </>
            ) : (
              "Delete Game"
            )}
          </button>
        </div>
      )}
    </article>
  );
}
