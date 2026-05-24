import { IMatchService } from "../../Domain/services/matches/IMatchService";
import { IMatchWriteRepository } from "../../Domain/repositories/matches/IMatchWriteRepository";
import { IMatchReadRepository } from "../../Domain/repositories/matches/IMatchReadRepository";
import { ITeamReadRepository } from "../../Domain/repositories/teams/ITeamReadRepository";
import { ITournamentReadRepository } from "../../Domain/repositories/tournaments/ITournamentReadRepository";
import { MatchDto } from "../../Domain/DTOs/matches/MatchDto";
import { UpdateMatchResultDto } from "../../Domain/DTOs/matches/UpdateMatchResultDto";
import { Result } from "../../Domain/types/Result";
import { ILoggerService } from "../../Domain/services/logger/ILoggerService";
import { TournamentFormat } from "../../Domain/enums/TournamentFormat";
import { Team } from "../../Domain/models/Team";

export class MatchService implements IMatchService {

  public constructor(
    private readonly matchWriteRepo: IMatchWriteRepository,
    private readonly matchReadRepo: IMatchReadRepository,
    private readonly teamReadRepo: ITeamReadRepository,
    private readonly tournamentReadRepo: ITournamentReadRepository,
    private readonly logger: ILoggerService
  ) {}

  private shuffleTeams<T>(teams: T[]): T[] {
    return [...teams].sort(() => Math.random() - 0.5);
  }

  private async createScheduledMatch(tournamentId: number, team1Id: number, team2Id: number): Promise<void> {
    await this.matchWriteRepo.create({
      tournament_id: tournamentId,
      team1_id: team1Id,
      team2_id: team2Id,
      scheduled_at: new Date(),
      result: null,
      winner_team_id: null,
      next_match_id: null,
      next_match_slot: null,
      status: "scheduled"
    });
  }

  private async generateRoundRobinMatches(tournamentId: number, teamIds: number[]): Promise<void> {
    for (let i = 0; i < teamIds.length; i += 1) {
      for (let j = i + 1; j < teamIds.length; j += 1) {
        await this.createScheduledMatch(tournamentId, teamIds[i], teamIds[j]);
      }
    }
  }

  private async generateSingleEliminationMatches(tournamentId: number, teamIds: number[]): Promise<void> {
    const shuffledTeams = this.shuffleTeams(teamIds);

    for (let i = 0; i < shuffledTeams.length; i += 2) {
      const team1Id = shuffledTeams[i];
      const team2Id = shuffledTeams[i + 1];

      if (!team2Id) {
        continue;
      }

      await this.createScheduledMatch(tournamentId, team1Id, team2Id);
    }
  }

  private async generateDoubleEliminationMatches(tournamentId: number, teamIds: number[]): Promise<void> {
    const shuffledTeams = this.shuffleTeams(teamIds);

    for (let i = 0; i < shuffledTeams.length; i += 2) {
      const team1Id = shuffledTeams[i];
      const team2Id = shuffledTeams[i + 1];

      if (!team2Id) {
        continue;
      }

      await this.createScheduledMatch(tournamentId, team1Id, team2Id);
      await this.createScheduledMatch(tournamentId, team1Id, team2Id);
      await this.createScheduledMatch(tournamentId, team1Id, team2Id);
    }
  }

  async getMatchesByTournament(tournamentId: number): Promise<Result<MatchDto[]>> {
    try {
      const matches = await this.matchReadRepo.findByTournament(tournamentId);
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
      const match = await this.matchReadRepo.findById(matchId);
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
      
    const match = await this.matchReadRepo.findById(matchId);

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

      const success = await this.matchWriteRepo.updateResult(matchId, dto.result, winnerTeamId);

      if (success && match.next_match_id && match.next_match_slot) {
        await this.matchWriteRepo.advanceWinnerToNextMatch(
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

      const isCaptain = await this.matchReadRepo.isCaptainOfTeamInMatch(matchId, captainId);
      if (!isCaptain) {
        return { success: false, error: "Only the team captain can add players to the match", statusCode: 403 };
      }

      const alreadyInMatch = await this.matchReadRepo.isPlayerInMatchTeam(matchId, userId);
      if (alreadyInMatch) {
        return { success: false, error: "Player is already in this match", statusCode: 400 };
      }

      const success = await this.matchWriteRepo.addPlayer(matchId, userId, teamId, performanceNotes);
      
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

      const isCaptain = await this.matchReadRepo.isCaptainOfTeamInMatch(matchId, captainId);
      const isSelf = captainId === userId;

      if (!isCaptain && !isSelf) {
        return { success: false, error: "Only the team captain or the player himself can remove a player", statusCode: 403 };
      }

      const success = await this.matchWriteRepo.removePlayer(matchId, userId);
      
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
      const tournament = await this.tournamentReadRepo.findById(tournamentId);

      if (!tournament) {
        return {
          success: false,
          error: "Tournament not found",
          statusCode: 404
        };
      }

      const existingMatches = await this.matchReadRepo.findByTournament(tournamentId);
      if (existingMatches.length > 0) {
        return {
          success: true,
          data: undefined
        };
      }

      const teams = await this.teamReadRepo.getConfirmedTournamentTeams(tournamentId);

      if (teams.length < 2) {
        return {
          success: false,
          error: "Not enough teams",
          statusCode: 400
        };
      }

      const teamIds = teams.map((team) => team.team_id);

      if (tournament.format === TournamentFormat.ROUND_ROBIN) {
        await this.generateRoundRobinMatches(tournamentId, teamIds);
      } else if (tournament.format === TournamentFormat.DOUBLE_ELIMINATION) {
        await this.generateDoubleEliminationMatches(tournamentId, teamIds);
      } else {
        await this.generateSingleEliminationMatches(tournamentId, teamIds);
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