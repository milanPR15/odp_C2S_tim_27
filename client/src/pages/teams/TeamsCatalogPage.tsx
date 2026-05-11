import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { teamsApi } from "../../api_services/teams/TeamsAPIService";
import type { TeamDto } from "../../models/team/TeamTypes";
import { Empty, ErrorBox, PageHeader, Spinner, StatCard } from "../../components/ui/UI";
import { TeamCard } from "../../components/team_display/TeamCard";

export default function TeamsCatalogPage() {
  const [teams, setTeams] = useState<TeamDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadTeams() {
      setIsLoading(true);
      setError("");

      const res = await teamsApi.getMyTeams();
      if (!active) return;

      if (!res.success) {
        setTeams([]);
        setError(res.message || "Failed to load teams.");
        setIsLoading(false);
        return;
      }

      setTeams(res.data ?? []);
      setIsLoading(false);
    }

    loadTeams();

    return () => {
      active = false;
    };
  }, []);

  const sortedTeams = useMemo(
    () => [...teams].sort((a, b) => a.team_name.localeCompare(b.team_name)),
    [teams],
  );

  return (
    <div>
      <PageHeader
        eyebrow="Teams"
        title="My Teams"
        action={
          <Link
            to="/teams/create"
            className="inline-flex items-center gap-2 h-10 rounded-xl border border-violet-300/40 bg-violet-300/15 px-4 text-xs font-medium uppercase tracking-wider text-violet-100 transition hover:bg-violet-300/20"
          >
            Create Team
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <StatCard label="Total Teams" value={sortedTeams.length} sub="Teams you are part of" />
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
      ) : sortedTeams.length === 0 ? (
        <div className="rounded-2xl border border-white/8 bg-white/3">
          <Empty message="You are not part of any teams yet." />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {sortedTeams.map((team) => (
             <TeamCard
               key={team.team_id}
               team={team}
             />
          ))}
        </div>
      )}
    </div>
  );
}
