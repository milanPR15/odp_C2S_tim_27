import { IMatchService } from "../../Domain/services/matches/IMatchService";
import { IMatchRepository } from "../../Domain/repositories/matches/IMatchRepository";
import { MatchDto } from "../../Domain/DTOs/matches/MatchDto";
import { UpdateMatchResultDto } from "../../Domain/DTOs/matches/UpdateMatchResultDto";
import { Result } from "../../Domain/types/Result";
import { ILoggerService } from "../../Domain/services/logger/ILoggerService";

export class MatchService implements IMatchService {

  public constructor(
    private readonly matchRepo: IMatchRepository,
    private readonly logger: ILoggerService
  ) {}

  async getMatchesByTournament(tournamentId: number): Promise<Result<MatchDto[]>> {
    try {
      const matches = await this.matchRepo.findByTournament(tournamentId);
      const dtos = matches.map(m => new MatchDto(
        m.match_id,
        m.tournament_id,
        m.team1_id,
        m.team2_id,
        m.scheduled_at,
        m.result
      ));
      return { success: true, data: dtos };
    } catch (err: any) {
      this.logger.error("MatchService", "getMatchesByTournament failed", err);
      return { success: false, error: "Failed to fetch matches", statusCode: 500 };
    }
  }

  async getMatchById(matchId: number): Promise<Result<MatchDto>> {
    try {
      const match = await this.matchRepo.findById(matchId);
      if (!match) {
        return { success: false, error: "Match not found", statusCode: 404 };
      }

      const dto = new MatchDto(
        match.match_id,
        match.tournament_id,
        match.team1_id,
        match.team2_id,
        match.scheduled_at,
        match.result
      );
      return { success: true, data: dto };
    } catch (err: any) {
      this.logger.error("MatchService", "getMatchById failed", err);
      return { success: false, error: "Failed to fetch match", statusCode: 500 };
    }
  }

  async updateMatchResult(matchId: number, adminId: number, dto: UpdateMatchResultDto): Promise<Result<void>> {
    if (!dto.isValid()) {
      return { success: false, error: "Invalid match result format (use X:Y)", statusCode: 400 };
    }

    try {
      const success = await this.matchRepo.updateResult(matchId, dto.result);
      if (!success) {
        return { success: false, error: "Match not found or could not be updated", statusCode: 404 };
      }

      this.logger.info("MatchService", `Admin ${adminId} updated result for match ${matchId} to ${dto.result}`);
      return { success: true, data: undefined };
    } catch (err: any) {
      this.logger.error("MatchService", "updateMatchResult failed", err);
      return { success: false, error: "Failed to update match result", statusCode: 500 };
    }
  }

  async addPlayerToMatch(matchId: number, captainId: number, userId: number, teamId: number, performanceNotes?: string): Promise<Result<void>> {
    // TODO: Proveriti da li je captainId zaista kapiten tima koji nastupa
    try {
      const success = await this.matchRepo.addPlayer(matchId, userId, teamId, performanceNotes);
      if (!success) {
        return { success: false, error: "Failed to add player to match", statusCode: 400 };
      }
      return { success: true, data: undefined };
    } catch (err: any) {
      this.logger.error("MatchService", "addPlayerToMatch failed", err);
      return { success: false, error: "Failed to add player", statusCode: 500 };
    }
  }

  async removePlayerFromMatch(matchId: number, captainId: number, userId: number): Promise<Result<void>> {
    // TODO: Proveriti dozvole
    try {
      const success = await this.matchRepo.removePlayer(matchId, userId);
      if (!success) {
        return { success: false, error: "Failed to remove player", statusCode: 400 };
      }
      return { success: true, data: undefined };
    } catch (err: any) {
      this.logger.error("MatchService", "removePlayerFromMatch failed", err);
      return { success: false, error: "Failed to remove player", statusCode: 500 };
    }
  }
}