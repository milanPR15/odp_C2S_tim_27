import { DbManager } from "../../connection/DbConnectionPool";
import { AuditLog } from "../../../Domain/models/AuditLog";
import { AuditLogMapper } from "./AuditLogMapper";
import { RowDataPacket } from "mysql2";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";

export class AuditLogReadRepository {
  constructor(private readonly db: DbManager, private readonly logger: ILoggerService) {}

  async getAll(): Promise<AuditLog[]> {
    const res = await this.db.getReadConnection();
    if (!res) return [];
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT * FROM audit_logs ORDER BY created_at DESC`
      );
      return rows.map(AuditLogMapper.fromRow);
    } catch (err) {
      this.logger.error("AuditLogReadRepository", "getAll failed", err);
      return [];
    } finally {
      res.conn.release();
    }
  }
}