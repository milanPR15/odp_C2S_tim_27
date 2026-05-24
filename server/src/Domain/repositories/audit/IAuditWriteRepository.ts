import { AuditLog } from "../../models/AuditLog";


export interface IAuditWriteRepository {
    create(log: Omit<AuditLog, 'id' | 'created_at'>): Promise<void>
}