import { RowDataPacket } from "mysql2";
import { Team } from "../../../Domain/models/Team";
import { TeamMember } from "../../../Domain/models/TeamMember";

export class TeamMapper {
  static fromRow(row: RowDataPacket): Team {
    return new Team(
      row.team_id,
      row.team_name,
      row.tag,
      row.logo,
      row.description ?? ""
    );
  }

  static memberFromRow(row: RowDataPacket): TeamMember {
    return TeamMember.fromDB(row);
  }
}