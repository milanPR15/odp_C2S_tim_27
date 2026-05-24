import { AuditLog } from "../../models/AuditLog";

export interface IAuditLogWriteRepository {
    create(log: Omit<AuditLog, "id" | "created_at">): Promise<void>;
}