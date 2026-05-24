import { Match } from "../../models/Match";


export interface IMatchWriteRepository {
  create(match: Omit<Match, 'match_id' | 'createdAt' | 'updatedAt'>): Promise<Match>;
  updateResult(matchId: number, result: string, winnerTeamId: number): Promise<boolean>;  
  addPlayer(matchId: number, userId: number, teamId: number, performanceNotes?: string): Promise<boolean>;
  removePlayer(matchId: number, userId: number): Promise<boolean>;
  advanceWinnerToNextMatch(nextMatchId: number, slot: 'team1' | 'team2', winnerTeamId: number): Promise<boolean>;
}