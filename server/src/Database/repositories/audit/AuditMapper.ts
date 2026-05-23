import { RowDataPacket } from "mysql2";
import { AuditLog } from "../../../Domain/models/AuditLog";

export class AuditMapper {
  static fromRow(r: RowDataPacket): AuditLog {
    return new AuditLog(
      r.id,
      r.user_id,
      r.action,
      r.entity,
      r.entity_id,
      r.meta ?? null,
      r.ip_address ?? null,
      new Date(r.created_at)
    );
  }
}



 