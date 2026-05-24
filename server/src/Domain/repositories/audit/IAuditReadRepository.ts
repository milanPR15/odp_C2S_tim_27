import { PaginatedListDto} from "../../DTOs/lists/PaginatedListDto";
import { AuditLog } from "../../models/AuditLog";


export interface IAuditReadRepository {
    findAll(page: number, limit: number): Promise<PaginatedListDto<AuditLog>>;
}
