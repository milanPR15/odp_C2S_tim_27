import { RowDataPacket, ResultSetHeader } from "mysql2";
import { IAuditRepository } from "../../../Domain/repositories/audit/IAuditRepository";
import { AuditLog } from "../../../Domain/models/AuditLog";
import { PaginatedListDto } from "../../../Domain/DTOs/entity/PaginatedListDto";
import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";

const safeInt = (n: number): number => Math.max(0, Math.floor(n));

export class AuditRepository implements IAuditRepository {
  public constructor(
    private readonly db: DbManager,
    private readonly logger: ILoggerService,
  ) {}

  private map(r: RowDataPacket): AuditLog {
    return new AuditLog(
      r.id,
      r.user_id,
      r.action,
      r.entity,
      r.entity_id,
      r.meta ?? null,
      r.ip_address ?? null,
      new Date(r.created_at)
    );
  }

  async create(log: Omit<AuditLog, 'id' | 'created_at'>): Promise<void> {
    const res = await this.db.getWriteConnection();
    if (!res) return;
    try {
      await res.conn.execute(
        `INSERT INTO audit_logs (user_id, action, entity, entity_id, meta, ip_address)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [log.user_id, log.action, log.entity, log.entity_id, log.meta, log.ip_address]
      );
    } catch (err) {
      this.logger.error("AuditRepository", "create failed", err);
    } finally {
      res.conn.release();
    }
  }

  async findAll(page: number, limit: number): Promise<PaginatedListDto<AuditLog>> {
    const res = await this.db.getReadConnection();
    if (!res) return new PaginatedListDto([], 0, page, limit);

    const offset = safeInt((page - 1) * limit);
    const lim = safeInt(limit);

    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ${lim} OFFSET ${offset}`
      );
      const [cnt] = await res.conn.execute<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM audit_logs`
      );

      return new PaginatedListDto(
        rows.map(r => this.map(r)),
        cnt[0]?.total ?? 0,
        page,
        limit
      );
    } catch (err) {
      this.logger.error("AuditRepository", "findAll failed", err);
      return new PaginatedListDto([], 0, page, limit);
    } finally {
      res.conn.release();
    }
  }
}