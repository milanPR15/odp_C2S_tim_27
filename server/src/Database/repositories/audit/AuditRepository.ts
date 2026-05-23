import { IAuditRepository } from "../../../Domain/repositories/audit/IAuditRepository";
import { AuditLog } from "../../../Domain/models/AuditLog";
import { PaginatedListDto } from "../../../Domain/DTOs/lists/PaginatedListDto";
import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";
import { AuditReadRepository } from "./AuditReadRepository";
import { AuditWriteRepository } from "./AuditWriteRepository";

export class AuditRepository implements IAuditRepository {
  private readonly readRepo: AuditReadRepository;
  private readonly writeRepo: AuditWriteRepository;

  public constructor(db: DbManager, logger: ILoggerService) {
    this.readRepo = new AuditReadRepository(db, logger);
    this.writeRepo = new AuditWriteRepository(db, logger);
  }

  async create(log: Omit<AuditLog, 'id' | 'created_at'>): Promise<void> {
    return this.writeRepo.create(log);
  }

  async findAll(page: number, limit: number): Promise<PaginatedListDto<AuditLog>> {
    return this.readRepo.findAll(page, limit);
  }
}