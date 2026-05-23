import { RowDataPacket } from "mysql2/promise";
import { User } from "../../../Domain/models/User";
import { UserRole } from "../../../Domain/enums/UserRole";

export class UserMapper {
  static fromRow(row: RowDataPacket): User {
    return new User(
      row.id,
      row.gamer_tag,
      row.full_name,
      row.email,
      row.role as UserRole,
      row.password_hash,
      row.is_active
    );
  }
}