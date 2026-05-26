export type WatchlistTournamentDto = {
  id: number;
  user_id: number;
  tournament_id: number;
  name: string;
  game_id: number;
  game_title: string;
  game_logo: string;
  format: "single_elimination" | "double_elimination" | "round_robin";
  max_teams: number;
  entry_deadline: string;
  prize_pool: number;
  status: "upcoming" | "ongoing" | "completed";
  added_at: string;
};