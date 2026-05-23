import { IUserRepository } from "../../../Domain/repositories/users/IUserRepository";
import { User } from "../../../Domain/models/User";
import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";
import { UpdateProfileDto } from "../../../Domain/DTOs/account/UpdateProfileDto";
import { UserReadRepository } from "./UserReadRepository";
import { UserWriteRepository } from "./UserWriteRepository";

export class UserRepository implements IUserRepository {
  private readonly readRepo: UserReadRepository;
  private readonly writeRepo: UserWriteRepository;

  constructor(db: DbManager, logger: ILoggerService) {
    this.readRepo = new UserReadRepository(db, logger);
    this.writeRepo = new UserWriteRepository(db, logger);
  }

  async create(user: User): Promise<User> {
    return this.writeRepo.create(user);
  }

  async findById(id: number): Promise<User> {
    return this.readRepo.findById(id);
  }

  async findByUsername(username: string): Promise<User> {
    return this.readRepo.findByUsername(username);
  }

  async findByEmail(email: string): Promise<User> {
    return this.readRepo.findByEmail(email);
  }

  async findAll(): Promise<User[]> {
    return this.readRepo.findAll();
  }

  async update(user: User): Promise<boolean> {
    return this.writeRepo.update(user);
  }

  async deactivate(id: number): Promise<boolean> {
    return this.writeRepo.deactivate(id);
  }

  async exists(id: number): Promise<boolean> {
    return this.readRepo.exists(id);
  }

  async updateProfile(userId: number, dto: UpdateProfileDto): Promise<boolean> {
    return this.writeRepo.updateProfile(userId, dto);
  }
}