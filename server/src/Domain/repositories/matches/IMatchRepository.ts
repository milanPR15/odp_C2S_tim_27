import { Match } from "../../models/Match";
import { MatchPlayer } from "../../models/MatchPlayers";
import { Result } from "../../types/Result";

export interface IMatchRepository {
  findByTournament(tournamentId: number): Promise<Match[]>;
  findById(matchId: number): Promise<Match | null>;
  create(match: Omit<Match, 'match_id' | 'createdAt' | 'updatedAt'>): Promise<Match>;
  updateResult(matchId: number, result: string): Promise<boolean>;
  addPlayer(matchId: number, userId: number, teamId: number, performanceNotes?: string): Promise<boolean>;
  removePlayer(matchId: number, userId: number): Promise<boolean>;
  findPlayers(matchId: number): Promise<MatchPlayer[]>;
}