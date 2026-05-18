import { Match } from "../../models/Match";
import { MatchPlayer } from "../../models/MatchPlayers";
import { Result } from "../../types/Result";

export interface IMatchRepository {
  findByTournament(tournamentId: number): Promise<Match[]>;
  findById(matchId: number): Promise<Match | null>;
  create(match: Omit<Match, 'match_id' | 'createdAt' | 'updatedAt'>): Promise<Match>;
  updateResult(matchId: number, result: string, winnerTeamId: number): Promise<boolean>;  
  addPlayer(matchId: number, userId: number, teamId: number, performanceNotes?: string): Promise<boolean>;
  removePlayer(matchId: number, userId: number): Promise<boolean>;
  findPlayers(matchId: number): Promise<MatchPlayer[]>;
  isCaptainOfTeamInMatch(matchId: number, captainId: number): Promise<boolean>;
  isPlayerInMatchTeam(matchId: number, userId: number): Promise<boolean>;
  advanceWinnerToNextMatch(nextMatchId: number, slot: 'team1' | 'team2', winnerTeamId: number): Promise<boolean>;
}