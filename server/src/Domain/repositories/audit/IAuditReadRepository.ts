import { AuditLog } from "../../models/AuditLog";
import { PaginatedList } from "../../models/PaginatedList";


export interface IAuditReadRepository {
    findAll(page: number, limit: number): Promise<PaginatedList<AuditLog>>;
}
