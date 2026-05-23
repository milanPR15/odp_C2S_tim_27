import { Link } from "react-router-dom";
import type { TeamDto } from "../../models/team/TeamTypes";

function formatDate(value: string | Date): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString();
}

type TeamCardProps = {
  team: TeamDto;
};

export function TeamCard({ team }: TeamCardProps) {
  return (
    <article className="group relative rounded-2xl border border-white/10 bg-linear-to-b from-white/10 to-white/5 p-5 shadow-lg shadow-black/20 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/30 hover:shadow-xl hover:shadow-violet-900/20 flex flex-col h-full">
      <Link to={`/teams/${team.team_id}`} className="absolute inset-0 z-10" aria-label={`View ${team.team_name} details`} />
      
      {/* Header section with Logo & Name */}
      <div className="flex items-center gap-4">
        {team.logo ? (
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/40">
            <img
              src={team.logo}
              alt={`${team.team_name} logo`}
              className="h-full w-full object-cover opacity-85 transition-opacity duration-300 group-hover:opacity-100"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-xl font-bold uppercase text-white/50">
            {team.tag || team.team_name.charAt(0)}
          </div>
        )}
        
        <div className="flex flex-col">
          <h3 className="text-lg font-bold tracking-tight text-white group-hover:text-violet-50 transition-colors">
            {team.team_name}
          </h3>
          {team.tag && (
            <span className="text-xs font-semibold uppercase tracking-wider text-violet-300">
              [{team.tag}]
            </span>
          )}
        </div>
      </div>

      <div className="mt-5 grow flex flex-col gap-3">
        {team.description && (
          <p className="text-sm text-white/60 line-clamp-2">
            {team.description}
          </p>
        )}
        
        <div className="mt-auto flex flex-col gap-2 text-sm text-white/50">
          {team.num_members !== undefined && (
            <div className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2 border border-white/5">
              <span className="font-medium">Members</span>
              <span className="text-violet-100 bg-violet-500/20 px-2 py-0.5 rounded-md font-semibold text-xs border border-violet-500/20">
                {team.num_members}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2 border border-white/5">
            <span className="font-medium">Created</span>
            <span className="text-white/70 text-xs">
              {formatDate(team.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
