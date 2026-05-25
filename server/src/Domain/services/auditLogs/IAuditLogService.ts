import { Result } from "../../types/Result";
import { AuditLogDto } from "../../DTOs/auditLogs/AuditLogDto";

export interface IAuditLogService {
  getAll(): Promise<Result<AuditLogDto[]>>;
  log(user_id: number, action: string, entity: string, entity_id: number, meta?: string, ip_address?: string): Promise<void>;
}