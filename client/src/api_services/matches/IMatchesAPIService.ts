export type ApiResponse<T> = { success: boolean; message: string; data?: T };

export interface MatchDto {
  match_id: number;
  tournament_id: number;
  team1_id: number | null;
  team2_id: number | null;
  scheduled_at: string;
  result: string | null;
  next_match_id?: number | null;
  next_match_slot?: 'team1' | 'team2' | null;
  loser_next_match_id?: number | null;
  loser_next_match_slot?: 'team1' | 'team2' | null;
  status?: string;
}

export interface UpdateMatchResultPayload {
  result: string;
}

export interface AddPlayerToMatchPayload {
  userId: number;
  teamId: number;
  performanceNotes?: string;
}

export interface IMatchesAPIService {
  getMatchesByTournament(tournamentId: number): Promise<ApiResponse<MatchDto[]>>;
  getMatchById(id: number): Promise<ApiResponse<MatchDto>>;
  updateMatchResult(id: number, payload: UpdateMatchResultPayload): Promise<ApiResponse<void>>;
  generateMatches(tournamentId: number): Promise<ApiResponse<void>>;
  addPlayerToMatch(id: number, payload: AddPlayerToMatchPayload): Promise<ApiResponse<void>>;
  removePlayerFromMatch(id: number, userId: number): Promise<ApiResponse<void>>;
}
