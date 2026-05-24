import { AuditLogDto } from "../../Domain/DTOs/auditLogs/AuditLogDto";
import { AuditLog } from "../../Domain/models/AuditLog";
import { IAuditLogWriteRepository } from "../../Domain/repositories/auditLogs/IAuditLogWriteRepository";
import { IAuditLogReadRepository } from "../../Domain/repositories/auditLogs/IAuditLogReadRepository";
import { IAuditLogService } from "../../Domain/services/auditLogs/IAuditLogService";
import { Result } from "../../Domain/types/Result";

export class AuditLogService implements IAuditLogService {
    public constructor(
        private readonly auditLogWriteRepository: IAuditLogWriteRepository,
        private readonly auditLogReadRepository: IAuditLogReadRepository
    ) {}


    private toDto(log: AuditLog): AuditLogDto {
        return new AuditLogDto(
            log.id,
            log.user_id,
            log.action,
            log.entity,
            log.entity_id,
            log.meta,
            log.ip_address,
            log.created_at
        );
    }

    async getAll(): Promise<Result<AuditLogDto[]>> {
        try {
            const logs = await this.auditLogReadRepository.getAll();
            return { success: true, data: logs.map(this.toDto) };
        } catch (error) {
            return { success: false, statusCode: 500, error: "Failed to retrieve audit logs from database." };
        }
    }

    async log(user_id: number, action: string, entity: string, entity_id: number, meta: string | null = null, ip_address: string | null = null): Promise<void> {
        try {
            await this.auditLogWriteRepository.create({
                user_id,
                action,
                entity,
                entity_id,
                meta,
                ip_address
            });
        } catch (error) {
            console.error("Failed to log activity:", error);
        }
    }
}