import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { teamsApi } from "../../api_services/teams/TeamsAPIService";
import { usersApi } from "../../api_services/users/UsersAPIService";
import { useAuth } from "../../hooks/auth/useAuthHook";
import {
  BackButton,
  ErrorBox,
  PageHeader,
  Spinner,
  StatCard,
  Modal,
} from "../../components/ui/UI";
import type { TeamDto } from "../../models/team/TeamTypes";
import type { UserDto } from "../../models/user/UserTypes";

function formatDate(value: string | Date | undefined): string {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString();
}

export default function TeamDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [team, setTeam] = useState<TeamDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [users, setUsers] = useState<UserDto[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let active = true;
    async function loadData() {
      if (!id) return;
      setIsLoading(true);
      setError("");

      const parsedId = parseInt(id, 10);
      if (isNaN(parsedId)) {
        if (active) setError("Invalid team ID.");
        if (active) setIsLoading(false);
        return;
      }
      
      const teamRes = await teamsApi.getTeamById(parsedId);
      
      if (!active) return;

      if (!teamRes.success || !teamRes.data) {
        setError(teamRes.message || "Failed to load team details.");
        setIsLoading(false);
        return;
      }

      setTeam(teamRes.data);
      setIsLoading(false);
    }    

    loadData();

    return () => {
      active = false;
    };
  }, [id]);

  async function openInviteModal() {
    setIsInviteModalOpen(true);
    if (users.length === 0) {
      setIsUsersLoading(true);
      const res = await usersApi.getAll();
      if (res.success && res.data) {
        setUsers(res.data);
      }
      setIsUsersLoading(false);
    }
  }

  async function handleSendInvite(gamer_tag: string) {
    if (!team) return;
    setInviteError("");
    setInviteSuccess("");
    const res = await teamsApi.sendInvite(team.team_id, gamer_tag);
    if (!res.success) {
      setInviteError(res.message || "Failed to send invite.");
    } else {
      setInviteSuccess(`Invite sent to ${gamer_tag}!`);
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <Spinner size={32} />
        <p className="text-sm text-white/40 font-mono tracking-widest uppercase">Loading team...</p>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div>
        <div className="mb-8">
          <BackButton fallbackTo="/teams" />
        </div>
        <ErrorBox message={error || "Team not found."} />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <BackButton fallbackTo="/teams" />
      </div>

      <div className="flex flex-col justify-between md:flex-row md:items-start gap-6 mb-8">
        {team.logo ? (
          <div className="h-32 w-32 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-xl">
            <img
              src={team.logo}
              alt={`${team.team_name} logo`}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-5xl font-bold uppercase text-white/50 shadow-xl">
            {team.tag || team.team_name.charAt(0)}
          </div>
        )}
        
        <div className="flex-1 mt-2">
          <PageHeader
            eyebrow={team.tag ? `Team • [${team.tag}]` : "Team"}
            title={team.team_name}
          />
        </div>

        {user && user.id === team.captain_id && (
          <button
            onClick={openInviteModal}
            className="self-start rounded-lg bg-cyan-500/20 px-8 py-4 text-sm font-medium text-cyan-300 hover:bg-cyan-500/30 transition"
          >
            Invite Members
          </button>
        )}
      </div>

      {team.description && (
        <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <h2 className="mb-3 text-xs font-mono uppercase tracking-widest text-white/30">About the Team</h2>
          <p className="text-white/70 leading-relaxed text-sm">
            {team.description}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          label="Captain"
          value={team.captain_gamer_tag || "Unknown"}
          sub={team.captain_id ? `User ID: ${team.captain_id}` : "No captain assigned"}
        />
        <StatCard
          label="Members"
          value={team.num_members ?? team.members?.length ?? 0}
          sub="Total Roster Size"
        />
        <StatCard
          label="Created At"
          value={formatDate(team.createdAt)}
          sub="Formation date"
        />
        <StatCard
          label="Team ID"
          value={`#${team.team_id}`}
          sub="System Identifier"
        />
      </div>

      {team.members && team.members.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-4 text-sm font-mono uppercase tracking-widest text-white/40">
            Team Members
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {team.members.map((member) => (
              <div
                key={member.user_id}
                className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/5 p-4"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/50">
                  {member.gamer_tag.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{member.gamer_tag}</span>
                    {member.role === 'captain' && (
                      <span className="rounded bg-violet-500/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-300">
                        Captain
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-white/40">Joined {formatDate(member.joined_at)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => {
          setIsInviteModalOpen(false);
          setInviteError("");
          setInviteSuccess("");
        }}
        title="Invite Users"
      >
        <div className="flex flex-col gap-4">
          {inviteError && <ErrorBox message={inviteError} />}
          {inviteSuccess && (
            <div className="border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 text-sm px-4 py-3 rounded-xl">
              {inviteSuccess}
            </div>
          )}

          <input
            type="text"
            placeholder="Search users by gamer tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
          />

          <div className="max-h-64 overflow-y-auto pr-2 flex flex-col gap-2">
            {isUsersLoading ? (
              <div className="flex justify-center p-4"><Spinner /></div>
            ) : (
              users
                .filter(u => 
                  u.username.toLowerCase().includes(searchQuery.toLowerCase()) &&
                  !team?.members?.some(m => m.user_id === u.id)
                )
                .map(u => (
                  <div key={u.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-sm font-medium text-white/90">{u.username}</span>
                    <button
                      onClick={() => handleSendInvite(u.username)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-colors"
                    >
                      Invite
                    </button>
                  </div>
                ))
            )}
            {!isUsersLoading && users.length > 0 && users.filter(u => !team?.members?.some(m => m.user_id === u.id)).length === 0 && (
              <p className="text-sm text-center text-white/30 py-4">No users available to invite.</p>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}