import { RowDataPacket } from "mysql2";
import { TeamInvitation } from "../../../Domain/models/TeamInvitation";
import { InvitationStatus } from "../../../Domain/enums/InvitationStatus";

export class TeamInvitationMapper {
  static fromRow(row: RowDataPacket): TeamInvitation {
    return new TeamInvitation(
      row.id,
      row.team_id,
      row.user_id,
      row.status as InvitationStatus,
      row.created_at ? new Date(row.created_at) : new Date(),
      row.updated_at ? new Date(row.updated_at) : new Date()
    );
  }
}