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
import { Match } from "../../Domain/models/Match";

type BracketParticipant = {
  teamId: number;
  matchId?: number;
  sourceKind: "team" | "winner" | "loser";
};

type EmptyBracketSlot = Record<string, never>;
type BracketSlot = BracketParticipant | EmptyBracketSlot;

type BracketStageResult = {
  createdMatches: Match[];
  nextParticipants: BracketSlot[];
};

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

  private nextPowerOfTwo(value: number): number {
    let power = 1;
    while (power < value) {
      power *= 2;
    }
    return power;
  }

  private isBracketParticipant(slot: BracketSlot): slot is BracketParticipant {
    return "teamId" in slot;
  }

  private async createBracketMatch(
    tournamentId: number,
    left: BracketParticipant,
    right: BracketParticipant
  ): Promise<Match> {
    return this.matchWriteRepo.create({
      tournament_id: tournamentId,
      team1_id: left.teamId,
      team2_id: right.teamId,
      winner_team_id: 0,
      next_match_id: 0,
      next_match_slot: "",
      loser_next_match_id: 0,
      loser_next_match_slot: "",
      status: "scheduled",
      scheduled_at: new Date(),
      result: "",
    });
  }

  private async createBracketStage(
    tournamentId: number,
    participants: BracketSlot[]
  ): Promise<BracketStageResult> {
    const createdMatches: Match[] = [];
    const nextParticipants: BracketSlot[] = [];

    for (let index = 0; index < participants.length; index += 2) {
      const left = participants[index] ?? {};
      const right = participants[index + 1] ?? {};

      if (!this.isBracketParticipant(left) && !this.isBracketParticipant(right)) {
        continue;
      }

      if (this.isBracketParticipant(left) && !this.isBracketParticipant(right)) {
        nextParticipants.push(left);
        continue;
      }

      if (!this.isBracketParticipant(left) && this.isBracketParticipant(right)) {
        nextParticipants.push(right);
        continue;
      }

      if (!this.isBracketParticipant(left) || !this.isBracketParticipant(right)) {
        continue;
      }

      const parentMatch = await this.createBracketMatch(tournamentId, left, right);
      createdMatches.push(parentMatch);

      await this.linkParticipantToParent(left, parentMatch.match_id, "team1");
      await this.linkParticipantToParent(right, parentMatch.match_id, "team2");

      nextParticipants.push({
        teamId: left.teamId,
        matchId: parentMatch.match_id,
        sourceKind: "winner",
      });
    }

    return { createdMatches, nextParticipants };
  }

  private async linkParticipantToParent(
    participant: BracketParticipant,
    parentMatchId: number,
    slot: 'team1' | 'team2'
  ): Promise<void> {
    if (!participant.matchId) {
      return;
    }

    if (participant.sourceKind === "winner") {
      await this.matchWriteRepo.updateNextMatch(participant.matchId, parentMatchId, slot);
      return;
    }

    if (participant.sourceKind === "loser") {
      await this.matchWriteRepo.updateLoserNextMatch(participant.matchId, parentMatchId, slot);
    }
  }

  private async createScheduledMatch(tournamentId: number, team1Id: number, team2Id: number): Promise<void> {
    await this.matchWriteRepo.create({
      tournament_id: tournamentId,
      team1_id: team1Id,
      team2_id: team2Id,
      scheduled_at: new Date(),
      result: "",
      winner_team_id: 0,
      next_match_id: 0,
      next_match_slot: "",
      loser_next_match_id: 0,
      loser_next_match_slot: "",
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
    const bracketSize = this.nextPowerOfTwo(teamIds.length);
    const bracketSlots: BracketSlot[] = [...teamIds.map((teamId) => ({
      teamId,
      sourceKind: "team" as const,
    }))];

    while (bracketSlots.length < bracketSize) {
      bracketSlots.push({});
    }

    let currentRound: BracketSlot[] = bracketSlots;

    while (currentRound.filter((participant) => this.isBracketParticipant(participant)).length > 1) {
      const roundResult = await this.createBracketStage(tournamentId, currentRound);
      currentRound = roundResult.nextParticipants;
    }
  }

  private async generateDoubleEliminationMatches(tournamentId: number, teamIds: number[]): Promise<void> {
    const bracketSize = this.nextPowerOfTwo(teamIds.length);
    const initialParticipants: BracketSlot[] = [...teamIds.map((teamId) => ({
      teamId,
      sourceKind: "team" as const,
    }))];

    while (initialParticipants.length < bracketSize) {
      initialParticipants.push({});
    }

    const winnersRounds: Match[][] = [];
    let currentWinnersRound: BracketSlot[] = initialParticipants;

    while (currentWinnersRound.filter((participant) => this.isBracketParticipant(participant)).length > 1) {
      const roundResult = await this.createBracketStage(tournamentId, currentWinnersRound);
      winnersRounds.push(roundResult.createdMatches);
      currentWinnersRound = roundResult.nextParticipants;
    }

    const winnersChampion = currentWinnersRound.find((participant): participant is BracketParticipant => this.isBracketParticipant(participant));
    if (!winnersChampion) {
      return;
    }

    let losersRoundParticipants: BracketSlot[] = [];

    for (let roundIndex = 0; roundIndex < Math.max(0, winnersRounds.length - 1); roundIndex += 1) {
      const losersFromThisWinnersRound = winnersRounds[roundIndex].map((match) => ({
        teamId: match.team1_id,
        matchId: match.match_id,
        sourceKind: "loser" as const,
      }));

      const stageParticipants = roundIndex === 0
        ? losersFromThisWinnersRound
        : [...losersRoundParticipants, ...losersFromThisWinnersRound];

      const stageResult = await this.createBracketStage(tournamentId, stageParticipants);
      losersRoundParticipants = stageResult.nextParticipants;
    }

    const finalWinnersRound = winnersRounds[winnersRounds.length - 1] ?? [];
    const losersFromFinalWinnersRound = finalWinnersRound.map((match) => ({
      teamId: match.team1_id,
      matchId: match.match_id,
      sourceKind: "loser" as const,
    }));

    if (losersFromFinalWinnersRound.length > 0) {
      const finalLosersStage = await this.createBracketStage(
        tournamentId,
        [...losersRoundParticipants, ...losersFromFinalWinnersRound]
      );
      losersRoundParticipants = finalLosersStage.nextParticipants;
    }

    while (losersRoundParticipants.filter((participant) => this.isBracketParticipant(participant)).length > 1) {
      const collapseStage = await this.createBracketStage(tournamentId, losersRoundParticipants);
      losersRoundParticipants = collapseStage.nextParticipants;
    }

    const losersChampion = losersRoundParticipants.find((participant): participant is BracketParticipant => this.isBracketParticipant(participant));
    if (!losersChampion) {
      return;
    }

    await this.createBracketStage(tournamentId, [winnersChampion, losersChampion]);
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
        m.result,
        m.next_match_id,
        m.next_match_slot,
        m.loser_next_match_id,
        m.loser_next_match_slot,
        m.status
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
      if (!match.match_id) {
        return { success: false, error: "Match not found", statusCode: 404 };
      }

      const dto = new MatchDto(
        match.match_id,
        match.tournament_id,
        match.team1_id,
        match.team2_id,
        match.scheduled_at,
        match.result,
        match.next_match_id,
        match.next_match_slot,
        match.loser_next_match_id,
        match.loser_next_match_slot,
        match.status
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

      if (!match.match_id) {
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

      if (success && match.loser_next_match_id && match.loser_next_match_slot) {
        const loserTeamId = winnerTeamId === match.team1_id ? match.team2_id : match.team1_id;
        await this.matchWriteRepo.advanceLoserToNextMatch(
          match.loser_next_match_id,
          match.loser_next_match_slot,
          loserTeamId
        );
      }

      if (!success) {
        return { success: false, error: "Match not found or could not be updated", statusCode: 404 };
      }

      this.logger.info("MatchService", `Admin ${adminId} updated result for match ${matchId} to ${dto.result}`);
      return { success: true };
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
      return { success: true };
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
      return { success: true };
    } catch (err) {
      this.logger.error("MatchService", "removePlayerFromMatch failed", String(err));
      return { success: false, error: "Failed to remove player from match", statusCode: 500 };
    }
  }

  async generateMatchesForTournament(tournamentId: number) : Promise<Result<void>> {
    try {
      const tournament = await this.tournamentReadRepo.findById(tournamentId);

      if (!tournament.tournament_id) {
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