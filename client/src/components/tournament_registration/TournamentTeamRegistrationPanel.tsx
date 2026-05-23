import { useEffect, useState } from "react";
import { gamesApi } from "../../api_services/games/GamesAPIService";
import { tournamentApi } from "../../api_services/tournament/TournamentAPIService";
import { teamsApi } from "../../api_services/teams/TeamsAPIService";
import { useAuth } from "../../hooks/auth/useAuthHook";
import type { TeamDto } from "../../models/team/TeamTypes";
import type { GameDto } from "../../models/game/GameTypes";
import type { TournamentDto } from "../../models/tournament/TournamentTypes";
import { Empty, ErrorBox, PageHeader, Spinner, SuccessBox } from "../ui/UI";

type Props = {
  tournament: TournamentDto;
  onRegistered?: () => void;
};

export function TournamentTeamRegistrationPanel({ tournament, onRegistered }: Props) {
  const { user } = useAuth();

  const [teams, setTeams] = useState<TeamDto[]>([]);
  const [game, setGame] = useState<GameDto | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [selectedPlayerIdsByTeam, setSelectedPlayerIdsByTeam] = useState<Record<number, number[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    async function loadTeams() {
      setIsLoading(true);
      setError("");

      const [teamsRes, gameRes] = await Promise.all([
        teamsApi.getMyTeams(),
        gamesApi.getById(tournament.game_id),
      ]);
      if (!active) return;

      if (!gameRes.success || !gameRes.data) {
        setError(gameRes.message || "Failed to load the game requirements.");
        setIsLoading(false);
        return;
      }

      setGame(gameRes.data);

      if (!teamsRes.success) {
        setError(teamsRes.message || "Failed to load your teams.");
        setTeams([]);
        setIsLoading(false);
        return;
      }

      const captainTeams = (teamsRes.data ?? []).filter((team) => team.captain_id === user?.id);
      setTeams(captainTeams);

      if (captainTeams.length > 0) {
        const firstTeam = captainTeams[0];
        setSelectedTeamId((current) => current ?? firstTeam.team_id);
        setSelectedPlayerIdsByTeam((current) => ({
          ...current,
          [firstTeam.team_id]: current[firstTeam.team_id] ?? (firstTeam.members ?? []).map((member) => member.user_id),
        }));
      }

      setIsLoading(false);
    }

    void loadTeams();

    return () => {
      active = false;
    };
  }, [user?.id]);

  const selectedTeam = teams.find((team) => team.team_id === selectedTeamId) ?? null;
  const selectedPlayerIds = selectedTeam ? (selectedPlayerIdsByTeam[selectedTeam.team_id] ?? selectedTeam.members?.map((member) => member.user_id) ?? []) : [];

  function selectTeam(team: TeamDto) {
    setSelectedTeamId(team.team_id);
    setError("");
    setSuccess("");
    setSelectedPlayerIdsByTeam((current) => ({
      ...current,
      [team.team_id]: current[team.team_id] ?? (team.members ?? []).map((member) => member.user_id),
    }));
  }

  function togglePlayer(teamId: number, userId: number) {
    setSelectedPlayerIdsByTeam((current) => {
      const existing = current[teamId] ?? [];
      const next = existing.includes(userId)
        ? existing.filter((id) => id !== userId)
        : [...existing, userId];

      return { ...current, [teamId]: next };
    });
  }

  async function handleRegister() {
    if (!selectedTeam) return;

    setError("");
    setSuccess("");

    if (!game) {
      setError("Game requirements are still loading.");
      return;
    }

    const payload = {
      teamId: selectedTeam.team_id,
      playerIds: selectedPlayerIds,
    };

    if (payload.playerIds.length === 0) {
      setError("Select at least one player before registering the team.");
      return;
    }

    if (payload.playerIds.length !== game.max_players) {
      setError(`This tournament requires exactly ${game.max_players} players. You selected ${payload.playerIds.length}.`);
      return;
    }

    setIsSubmitting(true);
    const res = await tournamentApi.registerTeam(tournament.tournament_id, payload);
    setIsSubmitting(false);

    if (!res.success) {
      setError(res.message || "Failed to register team.");
      return;
    }

    setSuccess(`Team ${selectedTeam.team_name} registered successfully.`);
    onRegistered?.();
  }

  const isRegistrationOpen = tournament.status === "upcoming";

  return (
    <section className="rounded-2xl border border-white/10 bg-linear-to-b from-white/10 to-white/5 p-5 shadow-lg shadow-black/20 backdrop-blur-md mb-8">
      <PageHeader eyebrow="Registration" title="Register Your Team" />

      {game && (
        <div className="mb-4 rounded-xl border border-white/8 bg-white/3 px-4 py-3 text-sm text-white/70">
          Required roster size for this game: <span className="font-semibold text-white">{game.max_players}</span> players.
        </div>
      )}

      {!isRegistrationOpen && (
        <div className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          Registration is only available while the tournament is upcoming.
        </div>
      )}

      {error && <div className="mb-4"><ErrorBox message={error} /></div>}
      {success && <div className="mb-4"><SuccessBox message={success} /></div>}

      {isLoading ? (
        <div className="flex min-h-40 items-center justify-center rounded-xl border border-white/8 bg-white/3">
          <Spinner size={22} />
        </div>
      ) : teams.length === 0 ? (
        <div className="rounded-xl border border-white/8 bg-white/3">
          <Empty message="You are not captain of any team yet." />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <div className="space-y-3">
            {teams.map((team) => {
              const isSelected = team.team_id === selectedTeamId;
              return (
                <button
                  key={team.team_id}
                  type="button"
                  onClick={() => selectTeam(team)}
                  className={`w-full rounded-xl border p-4 text-left transition ${isSelected ? "border-cyan-300/40 bg-cyan-300/10" : "border-white/8 bg-white/3 hover:border-white/15"}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-white font-semibold">{team.team_name}</p>
                      <p className="text-xs uppercase tracking-widest text-white/30">[{team.tag}]</p>
                    </div>
                    <p className="text-xs text-white/40">{team.members?.length ?? 0} players</p>
                  </div>
                  <div className="mt-3 text-xs text-white/50">
                    Captain: {team.captain_gamer_tag ?? "You"}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="rounded-xl border border-white/8 bg-black/20 p-4 sm:p-5">
            {!selectedTeam ? (
              <Empty message="Select a team to configure the tournament roster." />
            ) : (
              <div className="space-y-5">
                <div>
                  <h3 className="text-lg font-semibold text-white">{selectedTeam.team_name}</h3>
                  <p className="text-sm text-white/45">Choose the players that will be registered for {tournament.name}.</p>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {(selectedTeam.members ?? []).map((member) => {
                    const checked = selectedPlayerIds.includes(member.user_id);
                    return (
                      <label
                        key={member.user_id}
                        className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm transition ${checked ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-50" : "border-white/8 bg-white/3 text-white/75"}`}
                      >
                        <span>
                          <span className="block font-medium">{member.gamer_tag}</span>
                          <span className="block text-xs text-white/40">{member.role === "captain" ? "Captain" : "Member"}</span>
                        </span>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => togglePlayer(selectedTeam.team_id, member.user_id)}
                          className="h-4 w-4 rounded border-white/20 bg-transparent text-cyan-400 focus:ring-cyan-400"
                        />
                      </label>
                    );
                  })}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-white/50">
                    Selected players: <span className="text-white/90">{selectedPlayerIds.length}</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => void handleRegister()}
                    disabled={!isRegistrationOpen || isSubmitting}
                    className="inline-flex items-center justify-center rounded-xl border border-cyan-300/40 bg-cyan-300/15 px-4 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-300/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmitting ? "Registering..." : "Register Team"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
