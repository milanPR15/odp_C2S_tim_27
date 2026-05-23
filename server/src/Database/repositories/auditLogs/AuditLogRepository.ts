import { IAuditLogRepository } from "../../../Domain/repositories/auditLogs/IAuditLogRepository";
import { AuditLog } from "../../../Domain/models/AuditLog";
import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";
import { AuditLogReadRepository } from "./AuditLogReadRepository";
import { AuditLogWriteRepository } from "./AuditLogWriteRepository";

export class AuditLogRepository implements IAuditLogRepository {
  private readonly readRepo: AuditLogReadRepository;
  private readonly writeRepo: AuditLogWriteRepository;

  constructor(db: DbManager, logger: ILoggerService) {
    this.readRepo = new AuditLogReadRepository(db, logger);
    this.writeRepo = new AuditLogWriteRepository(db, logger);
  }

  async getAll(): Promise<AuditLog[]> {
    return this.readRepo.getAll();
  }

  async create(log: Omit<AuditLog, "id" | "created_at">): Promise<void> {
    return this.writeRepo.create(log);
  }
}