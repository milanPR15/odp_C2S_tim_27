import type { AuditLogDto } from "../../models/auditLog/AuditLogTypes";

export type ApiResponse<T> = { success: boolean; message?: string; data?: T };

export interface IAuditLogAPIService {
  getAll(): Promise<ApiResponse<AuditLogDto[]>>;
}