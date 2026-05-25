import { RowDataPacket } from "mysql2";
import { AuditLog } from "../../../Domain/models/AuditLog";

export class AuditLogMapper {
  static fromRow(r: RowDataPacket): AuditLog {
    return new AuditLog(
      r.id,
      r.user_id || 0,
      r.action,
      r.entity,
      r.entity_id,
      r.meta ?? "",
      r.ip_address ?? "",
      new Date(r.created_at)
    );
  }
}