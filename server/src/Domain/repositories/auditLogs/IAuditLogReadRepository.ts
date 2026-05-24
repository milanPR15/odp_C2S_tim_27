import { AuditLog } from "../../models/AuditLog";

export interface IAuditLogReadRepository {
    getAll(): Promise<AuditLog[]>;
}