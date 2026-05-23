import { IMatchService } from "../../Domain/services/matches/IMatchService";
import { IMatchRepository } from "../../Domain/repositories/matches/IMatchRepository";
import { ITeamRepository } from "../../Domain/repositories/teams/ITeamRepository";
import { MatchDto } from "../../Domain/DTOs/matches/MatchDto";
import { UpdateMatchResultDto } from "../../Domain/DTOs/matches/UpdateMatchResultDto";
import { Result } from "../../Domain/types/Result";
import { ILoggerService } from "../../Domain/services/logger/ILoggerService";

export class MatchService implements IMatchService {

  public constructor(
    private readonly matchRepo: IMatchRepository,
    private readonly teamRepo: ITeamRepository,
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
    } catch (err) {
      this.logger.error("MatchService", "getMatchesByTournament failed", String(err));
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
    } catch (err) {
      this.logger.error("MatchService", "getMatchById failed", String(err));
      return { success: false, error: "Failed to fetch match", statusCode: 500 };
    }
  }

  async updateMatchResult(matchId: number, adminId: number, dto: UpdateMatchResultDto): Promise<Result<void>> {
    if (!dto.isValid()) {
      return { success: false, error: "Invalid match result format (use X:Y)", statusCode: 400 };
    }

    try {
      
    const match = await this.matchRepo.findById(matchId);

      if (!match) {
        return {
          success: false,
          error: "Match not found",
          statusCode: 404
        };
      }

      const parts = dto.result.split(':');

      const team1Score = Number(parts[0]);
      const team2Score = Number(parts[1]);

      let winnerTeamId: number;

      if (team1Score > team2Score) {
        winnerTeamId = match.team1_id;
      } else {
        winnerTeamId = match.team2_id;
      }

      const success = await this.matchRepo.updateResult(matchId, dto.result, winnerTeamId);

      if (success && match.next_match_id && match.next_match_slot) {
        await this.matchRepo.advanceWinnerToNextMatch(
          match.next_match_id,
          match.next_match_slot,
          winnerTeamId
        );
      }

      if (!success) {
        return { success: false, error: "Match not found or could not be updated", statusCode: 404 };
      }

      this.logger.info("MatchService", `Admin ${adminId} updated result for match ${matchId} to ${dto.result}`);
      return { success: true, data: undefined };
    } catch (err) {
      this.logger.error("MatchService", "updateMatchResult failed", String(err));
      return { success: false, error: "Failed to update match result", statusCode: 500 };
    }
  }

    async addPlayerToMatch(
    matchId: number, 
    captainId: number, 
    userId: number, 
    teamId: number, 
    performanceNotes?: string
  ): Promise<Result<void>> {
    try {

      const isCaptain = await this.matchRepo.isCaptainOfTeamInMatch(matchId, captainId);
      if (!isCaptain) {
        return { success: false, error: "Only the team captain can add players to the match", statusCode: 403 };
      }

      const alreadyInMatch = await this.matchRepo.isPlayerInMatchTeam(matchId, userId);
      if (alreadyInMatch) {
        return { success: false, error: "Player is already in this match", statusCode: 400 };
      }

      const success = await this.matchRepo.addPlayer(matchId, userId, teamId, performanceNotes);
      
      if (!success) {
        return { success: false, error: "Failed to add player to match", statusCode: 400 };
      }

      this.logger.info("MatchService", `Player ${userId} added to match ${matchId} by captain ${captainId}`);
      return { success: true, data: undefined };
    } catch (err) {
      this.logger.error("MatchService", "addPlayerToMatch failed", String(err));
      return { success: false, error: "Failed to add player to match", statusCode: 500 };
    }
  }

  async removePlayerFromMatch(
    matchId: number, 
    captainId: number, 
    userId: number
  ): Promise<Result<void>> {
    try {

      const isCaptain = await this.matchRepo.isCaptainOfTeamInMatch(matchId, captainId);
      const isSelf = captainId === userId;

      if (!isCaptain && !isSelf) {
        return { success: false, error: "Only the team captain or the player himself can remove a player", statusCode: 403 };
      }

      const success = await this.matchRepo.removePlayer(matchId, userId);
      
      if (!success) {
        return { success: false, error: "Failed to remove player from match", statusCode: 400 };
      }

      this.logger.info("MatchService", `Player ${userId} removed from match ${matchId} by captain ${captainId}`);
      return { success: true, data: undefined };
    } catch (err) {
      this.logger.error("MatchService", "removePlayerFromMatch failed", String(err));
      return { success: false, error: "Failed to remove player from match", statusCode: 500 };
    }
  }

  async generateMatchesForTournament(tournamentId: number) : Promise<Result<void>> {
    try {
      const teams = await this.teamRepo.getRegisteredTournamentTeams(tournamentId);

      if (teams.length < 2) {
        return {
          success: false,
          error: "Not enough teams",
          statusCode: 400
        };
      }

      const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);

      for (let i = 0; i < shuffledTeams.length; i += 2) {

        const team1 = shuffledTeams[i];
        const team2 = shuffledTeams[i + 1];

        if (!team2) {
          continue;
        }

        await this.matchRepo.create({
          tournament_id: tournamentId,
          team1_id: team1.team_id,
          team2_id: team2.team_id,
          scheduled_at: new Date(),
          result: null,
          winner_team_id: null,
          next_match_id: null,
          next_match_slot: null,
          status: "scheduled"
        });
      }

      return {
        success: true,
        data: undefined
      };

    } catch (err) {

      this.logger.error("MatchService", "generateMatchesForTournament failed",String(err));

      return {
        success: false,
        error: "Failed to generate matches",
        statusCode: 500
      };
    }
  }
}