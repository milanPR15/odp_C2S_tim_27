import { ITournamentRepository } from "../../../Domain/repositories/tournaments/ITournamentRepository";
import { Tournament } from "../../../Domain/models/Tournament";
import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";
import { TournamentReadRepository } from "./TournamentReadRepository";
import { TournamentWriteRepository } from "./TournamentWriteRepository";

export class TournamentRepository implements ITournamentRepository {
  private readonly readRepo: TournamentReadRepository;
  private readonly writeRepo: TournamentWriteRepository;

  constructor(db: DbManager, logger: ILoggerService) {
    this.readRepo = new TournamentReadRepository(db, logger);
    this.writeRepo = new TournamentWriteRepository(db, logger);
  }

  async create(tournament: Tournament): Promise<Tournament> {
    return this.writeRepo.create(tournament);
  }

  async findById(id: number): Promise<Tournament | null> {
    return this.readRepo.findById(id);
  }

  async findByGameId(gameId: number): Promise<Tournament[]> {
    return this.readRepo.findByGameId(gameId);
  }

  async findByName(name: string): Promise<Tournament> {
    return this.readRepo.findByName(name);
  }

  async findAll(): Promise<Tournament[]> {
    return this.readRepo.findAll();
  }

  async update(tournament?: Tournament): Promise<boolean> {
    return this.writeRepo.update(tournament);
  }

  async delete(id: number): Promise<boolean> {
    return this.writeRepo.delete(id);
  }
}