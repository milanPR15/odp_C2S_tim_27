import { AuditLog } from "../../models/AuditLog";
import { PaginatedListDto} from "../../DTOs/entity/PaginatedListDto";

export interface IAuditRepository {
    create(log: Omit<AuditLog, 'id' | 'created_at'>): Promise<void>
    findAll(page: number, limit: number): Promise<PaginatedListDto<AuditLog>>;
}