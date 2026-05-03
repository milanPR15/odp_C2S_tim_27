import { AuditLog } from "../../models/AuditLog";

export interface IAuditLogRepository {
    getAll(): Promise<AuditLog[]>;
    create(log: Omit<AuditLog, "id" | "created_at">): Promise<void>;
}