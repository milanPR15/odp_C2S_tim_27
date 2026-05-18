import { MatchDto } from "../../DTOs/matches/MatchDto";
import { UpdateMatchResultDto } from "../../DTOs/matches/UpdateMatchResultDto";
import { Result } from "../../types/Result";

export interface IMatchService {
  getMatchesByTournament(tournamentId: number): Promise<Result<MatchDto[]>>;
  getMatchById(matchId: number): Promise<Result<MatchDto>>;
  updateMatchResult(matchId: number, adminId: number, dto: UpdateMatchResultDto): Promise<Result<void>>;
  addPlayerToMatch(matchId: number, captainId: number, userId: number, teamId: number, performanceNotes?: string): Promise<Result<void>>;
  removePlayerFromMatch(matchId: number, captainId: number, userId: number): Promise<Result<void>>;
  generateMatchesForTournament(tournamentId: number): Promise<Result<void>>;
}