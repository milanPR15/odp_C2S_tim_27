import { useEffect, useState, useRef } from "react";
import type { FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import type { TeamDto, UpdateTeamDto } from "../../models/team/TeamTypes";
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
  const [team, setTeam] = useState<TeamDto>({} as TeamDto);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState("");
  const [editForm, setEditForm] = useState<UpdateTeamDto>({ team_name: "", tag: "", description: "", logo: "" });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [removingMemberIds, setRemovingMemberIds] = useState<number[]>([]);
  const [removeError, setRemoveError] = useState("");
  const [logoFileName, setLogoFileName] = useState("");
  const editLogoInputRef = useRef<HTMLInputElement>({} as HTMLInputElement);
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

  function openEditModal() {
    if (!team) return;
    setEditForm({
      team_name: team.team_name ?? "",
      tag: team.tag ?? "",
      description: team.description ?? "",
      logo: team.logo ?? "",
    });
    setUpdateError("");
    setUpdateSuccess("");
    setIsEditModalOpen(true);
  }

  function openDeleteModal() {
    setDeleteError("");
    setIsDeleteModalOpen(true);
  }

  const navigate = useNavigate();

  async function handleDeleteTeam() {
    if (!team) return;
    setDeleteError("");
    setIsDeleting(true);
    try {
      if (!user || user.id !== team.captain_id) {
        setDeleteError("Only the team captain can delete this team.");
        return;
      }
      const res = await teamsApi.deleteTeam(team.team_id);
      if (!res.success) {
        setDeleteError(res.message || "Failed to delete team.");
        return;
      }
      // on success, navigate back to teams list
      navigate("/teams");
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  }

  async function handleRemoveMember(memberId: number) {
    if (!team) return;
    if (!user || user.id !== team.captain_id) {
      setRemoveError("Only the team captain can remove members.");
      return;
    }
    if (!window.confirm("Are you sure you want to remove this member from the team?")) return;
    setRemoveError("");
    setRemovingMemberIds((s) => [...s, memberId]);
    try {
      const res = await teamsApi.removeMember(team.team_id, memberId);
      if (!res.success) {
        setRemoveError(res.message || "Failed to remove member.");
        return;
      }
      setTeam((prev) => prev ? { ...prev, members: prev.members?.filter(m => m.user_id !== memberId) } : prev);
    } finally {
      setRemovingMemberIds((s) => s.filter(id => id !== memberId));
    }
  }

  async function handleUpdateTeam(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!team) return;
    setUpdateError("");
    setUpdateSuccess("");
    setIsUpdating(true);
    try {
      const payload: UpdateTeamDto = {
        team_name: editForm.team_name?.trim() ?? "",
        tag: editForm.tag?.trim().toUpperCase() ?? "",
        description: editForm.description?.trim() || undefined,
        logo: editForm.logo?.trim() || undefined,
      };

      const res = await teamsApi.updateTeam(team.team_id, payload);
      if (!res.success || !res.data) {
        setUpdateError(res.message || "Failed to update team.");
        return;
      }

      setTeam(res.data);
      setUpdateSuccess("Team updated successfully.");
      setIsEditModalOpen(false);
    } finally {
      setIsUpdating(false);
    }
  }

  function handleEditLogoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setUpdateError("");
    setUpdateSuccess("");

    if (!file) {
      setEditForm((prev) => ({ ...prev, logo: "" }));
      setLogoFileName("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setEditForm((prev) => ({ ...prev, logo: "" }));
      setLogoFileName("");
      setUpdateError("Please upload an image file for the logo.");
      event.target.value = "";
      return;
    }

    const maxFileSize = 5 * 1024 * 1024;
    if (file.size > maxFileSize) {
      setEditForm((prev) => ({ ...prev, logo: "" }));
      setLogoFileName("");
      setUpdateError("Logo image must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        setEditForm((prev) => ({ ...prev, logo: result }));
        setLogoFileName(file.name);
      } else {
        setEditForm((prev) => ({ ...prev, logo: "" }));
        setLogoFileName("");
        setUpdateError("Failed to read the selected image.");
        event.target.value = "";
      }
    };
    reader.onerror = () => {
      setEditForm((prev) => ({ ...prev, logo: "" }));
      setLogoFileName("");
      setUpdateError("Failed to read the selected image.");
      event.target.value = "";
    };
    reader.readAsDataURL(file);
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
          <div className="flex gap-3 self-start">
            <button
              onClick={openInviteModal}
              className="rounded-lg bg-cyan-500/20 px-6 py-3 text-sm font-medium text-cyan-300 hover:bg-cyan-500/30 transition"
            >
              Invite Members
            </button>
            <button
              onClick={openEditModal}
              className="rounded-lg bg-violet-500/20 px-6 py-3 text-sm font-medium text-violet-200 hover:bg-violet-500/30 transition"
            >
              Update Team
            </button>
            <button
              onClick={openDeleteModal}
              className="rounded-lg bg-red-500/10 px-6 py-3 text-sm font-medium text-red-300 hover:bg-red-500/20 transition"
            >
              Delete Team
            </button>
          </div>
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
          {removeError && <div className="mb-4"><ErrorBox message={removeError} /></div>}
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
                {user && user.id === team.captain_id && member.user_id !== team.captain_id && (
                  <div className="ml-auto">
                    <button
                      onClick={() => handleRemoveMember(member.user_id)}
                      disabled={removingMemberIds.includes(member.user_id)}
                      className="inline-flex h-9 items-center gap-2 rounded-lg bg-red-500/10 px-3 text-xs font-semibold text-red-300 hover:bg-red-500/20 disabled:opacity-50"
                    >
                      {removingMemberIds.includes(member.user_id) ? 'Removing...' : 'Remove'}
                    </button>
                  </div>
                )}
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

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setUpdateError("");
          setUpdateSuccess("");
        }}
        title="Update Team"
      >
        <form onSubmit={handleUpdateTeam} className="flex flex-col gap-4">
          {updateError && <ErrorBox message={updateError} />}
          {updateSuccess && (
            <div className="border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 text-sm px-4 py-3 rounded-xl">
              {updateSuccess}
            </div>
          )}

          <label className="flex flex-col gap-2">
            <span className="text-[11px] uppercase tracking-[0.18em] text-white/45 font-medium">Team Name</span>
            <input
              value={editForm.team_name}
              onChange={(e) => setEditForm((p) => ({ ...p, team_name: e.target.value }))}
              className="h-11 w-full rounded-xl border border-white/12 bg-black/30 px-3 text-sm text-white"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-[11px] uppercase tracking-[0.18em] text-white/45 font-medium">Tag</span>
            <input
              value={editForm.tag}
              onChange={(e) => setEditForm((p) => ({ ...p, tag: e.target.value }))}
              maxLength={5}
              className="h-11 w-full rounded-xl border border-white/12 bg-black/30 px-3 text-sm text-white"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-[11px] uppercase tracking-[0.18em] text-white/45 font-medium">Description</span>
            <textarea
              value={editForm.description || ""}
              onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
              className="h-28 w-full rounded-xl border border-white/12 bg-black/30 px-3 text-sm text-white p-3"
            />
          </label>

          <div className="flex flex-col gap-2">
            <span className="text-[11px] uppercase tracking-[0.18em] text-white/45 font-medium">Team Logo</span>
            {editForm.logo ? (
              <div className="mt-1 flex items-center gap-4 border border-white/8 bg-white/5 rounded-xl p-3 pr-4">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-black flex items-center justify-center">
                  <img src={editForm.logo} alt="Preview" className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/60 truncate">{logoFileName || "Current logo"}</p>
                  <div className="mt-1 flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setEditForm((prev) => ({ ...prev, logo: "" }));
                        setLogoFileName("");
                        if (editLogoInputRef.current) editLogoInputRef.current.value = "";
                      }}
                      className="text-[10px] uppercase tracking-wider text-red-300 hover:text-red-200 transition-colors"
                    >
                      Remove
                    </button>
                    <label className="text-[10px] uppercase tracking-wider text-white/60 cursor-pointer">
                      <span className="px-2 py-1 bg-white/10 rounded">Replace</span>
                      <input
                        ref={editLogoInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleEditLogoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            ) : (
              <label className={`h-11 w-full rounded-xl border border-white/12 bg-black/30 px-3 text-sm text-white flex items-center justify-between cursor-pointer group hover:border-violet-300/40`}>
                <span className="text-white/40 group-hover:text-white/60 transition-colors">Choose image file...</span>
                <span className="text-xs bg-white/10 px-2 py-1 rounded text-white/60 group-hover:text-white/80 transition-colors">Browse</span>
                <input
                  ref={editLogoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleEditLogoUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/12 px-4 text-sm font-medium text-white/80"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-violet-500 px-4 text-sm font-semibold text-white disabled:opacity-50"
            >
              {isUpdating ? "Updating..." : "Update Team"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteError("");
        }}
        title="Delete Team"
      >
        <div className="flex flex-col gap-4">
          {deleteError && <ErrorBox message={deleteError} />}
          <p className="text-sm text-white/70">Are you sure you want to delete this team? This action cannot be undone.</p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/12 px-4 text-sm font-medium text-white/80"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteTeam}
              disabled={isDeleting}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-red-500 px-4 text-sm font-semibold text-white disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Delete Team"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}