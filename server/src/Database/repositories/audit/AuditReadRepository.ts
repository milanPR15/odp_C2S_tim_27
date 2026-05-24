import { DbManager } from "../../connection/DbConnectionPool";
import { PaginatedListDto } from "../../../Domain/DTOs/lists/PaginatedListDto";
import { AuditLog } from "../../../Domain/models/AuditLog";
import { AuditMapper } from "./AuditMapper";
import { RowDataPacket } from "mysql2";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";
import { IAuditLogRepository } from "../../../Domain/repositories/auditLogs/IAuditLogRepository";
import { IAuditReadRepository } from "../../../Domain/repositories/audit/IAuditReadRepository";

export class AuditReadRepository implements IAuditReadRepository{
  constructor(
    private readonly db: DbManager,
    private readonly logger: ILoggerService
  ) {}

  async findAll(page: number, limit: number): Promise<PaginatedListDto<AuditLog>> {
    const res = await this.db.getReadConnection();
    if (!res) return new PaginatedListDto([], 0, page, limit);

    const offset = Math.max(0, (page - 1) * limit);
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [limit, offset]
      );
      const [cnt] = await res.conn.execute<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM audit_logs`
      );

      return new PaginatedListDto(
        rows.map(AuditMapper.fromRow),
        cnt[0]?.total ?? 0,
        page,
        limit
      );
    }
    catch (err) {
      this.logger.error("AuditReadRepository", "findAll failed", err);
      return new PaginatedListDto([], 0, page, limit);  
    } finally {
      res.conn.release();
    }
  }
}