import { IGamesRepository } from "../../../Domain/repositories/games/IGamesRepository";
import { Game } from "../../../Domain/models/Game";
import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";
import { GameReadRepository } from "./GamesReadRepository";
import { GameWriteRepository } from "./GamesWriteRepository";

export class GamesRepository implements IGamesRepository {
  private readonly readRepo: GameReadRepository;
  private readonly writeRepo: GameWriteRepository;

  constructor(db: DbManager, logger: ILoggerService) {
    this.readRepo = new GameReadRepository(db, logger);
    this.writeRepo = new GameWriteRepository(db, logger);
  }

  async getById(id: number): Promise<Game | null> {
    return this.readRepo.getById(id);
  }

  async getByName(name: string): Promise<Game | null> {
    return this.readRepo.getByName(name);
  }

  async getAll(): Promise<Game[]> {
    return this.readRepo.getAll();
  }

  async create(game: Game): Promise<Game | null> {
    return this.writeRepo.create(game);
  }

  async update(game: Game): Promise<boolean> {
    return this.writeRepo.update(game);
  }

  async delete(id: number): Promise<boolean> {
    return this.writeRepo.delete(id);
  }
}