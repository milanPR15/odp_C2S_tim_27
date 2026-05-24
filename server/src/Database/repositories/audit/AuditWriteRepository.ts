import { DbManager } from "../../connection/DbConnectionPool";
import { AuditLog } from "../../../Domain/models/AuditLog";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";
import { IAuditWriteRepository } from "../../../Domain/repositories/audit/IAuditWriteRepository";

export class AuditWriteRepository implements IAuditWriteRepository{
  constructor(
    private readonly db: DbManager,
    private readonly logger: ILoggerService
  ) {}

  async create(log: Omit<AuditLog, 'id' | 'created_at'>): Promise<void> {
    const res = await this.db.getWriteConnection();
    if (!res) return;
    try {
      await res.conn.execute(
        `INSERT INTO audit_logs (user_id, action, entity, entity_id, meta, ip_address)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [log.user_id, log.action, log.entity, log.entity_id, log.meta, log.ip_address]
      );
    }
    catch (err) {
      this.logger.error("AuditWriteRepository", "create failed", err);
    } finally {
      res.conn.release();
    }
  }
}