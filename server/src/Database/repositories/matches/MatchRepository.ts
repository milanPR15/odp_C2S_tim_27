import { IMatchRepository } from "../../../Domain/repositories/matches/IMatchRepository";
import { Match, MatchRow } from "../../../Domain/models/Match";
import { MatchPlayer } from "../../../Domain/models/MatchPlayers";
import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";
import { MatchReadRepository } from "./MatchReadRepository";
import { MatchWriteRepository } from "./MatchWriteRepository";

export class MatchRepository implements IMatchRepository {
  private readonly readRepo: MatchReadRepository;
  private readonly writeRepo: MatchWriteRepository;

  constructor(db: DbManager, logger: ILoggerService) {
    this.readRepo = new MatchReadRepository(db, logger);
    this.writeRepo = new MatchWriteRepository(db, logger);
  }

  async findByTournament(tournamentId: number): Promise<Match[]> {
    return this.readRepo.findByTournament(tournamentId);
  }

  async findById(matchId: number): Promise<Match | null> {
    return this.readRepo.findById(matchId);
  }

  async create(match: Omit<Match, 'match_id' | 'createdAt' | 'updatedAt'>): Promise<Match> {
    return this.writeRepo.create(match);
  }

  async updateResult(matchId: number, result: string, winnerTeamId: number): Promise<boolean> {
    return this.writeRepo.updateResult(matchId, result, winnerTeamId);
  }

  async addPlayer(matchId: number, userId: number, teamId: number, performanceNotes?: string): Promise<boolean> {
    return this.writeRepo.addPlayer(matchId, userId, teamId, performanceNotes);
  }

  async removePlayer(matchId: number, userId: number): Promise<boolean> {
    return this.writeRepo.removePlayer(matchId, userId);
  }

  async findPlayers(matchId: number): Promise<MatchPlayer[]> {
    return this.readRepo.findPlayers(matchId);
  }

  async isCaptainOfTeamInMatch(matchId: number, captainId: number): Promise<boolean> {
    return this.readRepo.isCaptainOfTeamInMatch(matchId, captainId);
  }

  async isPlayerInMatchTeam(matchId: number, userId: number): Promise<boolean> {
    return this.readRepo.isPlayerInMatchTeam(matchId, userId);
  }

  async advanceWinnerToNextMatch(nextMatchId: number, slot: 'team1' | 'team2', winnerTeamId: number): Promise<boolean> {
    return this.writeRepo.advanceWinnerToNextMatch(nextMatchId, slot, winnerTeamId);
  }
}
