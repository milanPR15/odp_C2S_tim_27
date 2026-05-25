import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { teamsApi } from "../../api_services/teams/TeamsAPIService";
import type { TeamDto, TeamInvitationDto } from "../../models/team/TeamTypes";
import { Empty, ErrorBox, PageHeader, Spinner, StatCard } from "../../components/ui/UI";
import { TeamCard } from "../../components/team_display/TeamCard";

export default function TeamsCatalogPage() {
  const [teams, setTeams] = useState<TeamDto[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitationDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [inviteProcessId, setInviteProcessId] = useState<number>(0);

  useEffect(() => {
    let active = true;

    async function loadData() {
      setIsLoading(true);
      setError("");

      try {
        const [teamsRes, invitesRes] = await Promise.all([
          teamsApi.getMyTeams(),
          teamsApi.getMyInvitations()
        ]);

        if (!active) return;
        
        if (!teamsRes.success || !invitesRes.success) {
          setError(teamsRes.message || invitesRes.message || "Failed to load data.");
          setTeams(teamsRes.data ?? []);
          setInvitations(invitesRes.data?.filter(i => i.status === 'pending') ?? []);
        } else {
          setTeams(teamsRes.data ?? []);
          setInvitations(invitesRes.data?.filter(i => i.status === 'pending') ?? []);
        }
      } catch {
        if (active) setError("An error occurred while loading data.");
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, []);

  const handleRespondToInvite = async (teamId: number, accept: boolean) => {
    if (teamId === 0) return;

    setInviteProcessId(teamId);
    setError("");
    
    const res = await teamsApi.respondToInvite(teamId, accept);
    setInviteProcessId(0);
    
    if (!res.success) {
      setError(res.message || "Failed to respond to invitation.");
      return;
    }

    setInvitations(prev => prev.filter(i => i.team_id !== teamId));
    
    if (accept) {
      const teamsRes = await teamsApi.getMyTeams();
      if (teamsRes.success) {
        setTeams(teamsRes.data ?? []);
      }
    }
  };

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

      {invitations.length > 0 && !isLoading && (
        <div className="mb-8 space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-violet-300">Pending Invitations ({invitations.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {invitations.map(invite => (
              <div key={invite.id} className="flex flex-col gap-3 rounded-xl border border-violet-500/20 bg-violet-500/5 p-4 transition hover:bg-violet-500/10">
                <div className="flex-1">
                  <p className="text-sm text-gray-300">
                    You have been invited to join <span className="font-semibold text-white">{invite.team_name || `Team #${invite.team_id}`}</span>.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRespondToInvite(invite.team_id, true)}
                    disabled={inviteProcessId === invite.team_id}
                    className="flex-1 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-violet-500 disabled:opacity-50"
                  >
                    {inviteProcessId === invite.team_id ? <Spinner size={12} /> : "Accept"}
                  </button>
                  <button
                    onClick={() => handleRespondToInvite(invite.team_id, false)}
                    disabled={inviteProcessId === invite.team_id}
                    className="flex-1 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-200 transition hover:bg-red-500/20 hover:text-red-100 disabled:opacity-50"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
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
