export type CreateTournamentDto = {
  name: string;
  game_id: number;
  format: "single_elimination" | "double_elimination" | "round_robin";
  max_teams: number;
  entry_deadline: string;
  prize_pool: number;
  status: "upcoming" | "ongoing" | "completed";
};

export type TournamentDto = {
  tournament_id: number;
  name: string;
  game_id: number;
  format: "single_elimination" | "double_elimination" | "round_robin";
  max_teams: number;
  entry_deadline: string;
  prize_pool: number;
  status: "upcoming" | "ongoing" | "completed";
  createdAt: string;
  updatedAt: string;
};

export type UpdateTournamentDto = {
  name?: string;
  game_id?: number;
  format?: "single_elimination" | "double_elimination" | "round_robin";
  max_teams?: number;
  entry_deadline?: string;
  prize_pool?: number;
  status?: "upcoming" | "ongoing" | "completed";
};

export type RegisterTournamentTeamDto = {
  teamId: number;
  playerIds: number[];
};

export type TournamentRegistrationDto = {
  id: number;
  tournament_id: number;
  team_id: number;
  team_name: string;
  status: "pending" | "confirmed" | "disqualified";
  seed: number;
  registered_at: string;
  selected_player_ids: number[];
};