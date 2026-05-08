import { RowDataPacket } from 'mysql2';
import { AuditLog } from '../../../Domain/models/AuditLog';
import { IAuditLogRepository } from '../../../Domain/repositories/auditLogs/IAuditLogRepository';
import { ILoggerService } from '../../../Domain/services/logger/ILoggerService';
import { DbManager } from '../../connection/DbConnectionPool';

export class AuditLogRepository implements IAuditLogRepository {
    public constructor(
        private readonly db: DbManager,
        private readonly logger: ILoggerService
    ) {}

    private map(r: RowDataPacket): AuditLog {
        return new AuditLog(
            r.id, 
            r.user_id || 0, // Fallback if null
            r.action, 
            r.entity, 
            r.entity_id, 
            r.meta, 
            r.ip_address, 
            r.created_at
        );
    }

    async getAll(): Promise<AuditLog[]> {
        const res = await this.db.getReadConnection();
        if (!res) return [];
        try {
            const [rows] = await res.conn.execute<RowDataPacket[]>(
                `SELECT * FROM audit_logs ORDER BY created_at DESC`
            );
            return rows.map((r) => this.map(r));
        } catch (err) {
            this.logger.error('AuditLog repository', "getAll failed", err);
            return [];
        } finally { 
            res.conn.release(); 
        }
    }

    async create(log: Omit<AuditLog, "id" | "created_at">): Promise<void> {
        const res = await this.db.getWriteConnection();
        if (!res) return;
        try {
            await res.conn.execute(
                `INSERT INTO audit_logs (user_id, action, entity, entity_id, meta, ip_address) VALUES (?, ?, ?, ?, ?, ?)`,
                [log.user_id, log.action, log.entity, log.entity_id, log.meta, log.ip_address]
            );
        } catch (err) {
            this.logger.error('AuditLog repository', "create failed", err);
        } finally {
            res.conn.release();
        }
    }
}