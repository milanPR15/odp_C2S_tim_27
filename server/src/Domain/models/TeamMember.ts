import { TeamRole } from "../enums/TeamRole";

export class TeamMember {
  constructor(
    public id: number = 0,
    public team_id: number = 0,
    public user_id: number = 0,
    public role: TeamRole = TeamRole.MEMBER,
    public joined_at: Date = new Date()
  ) {}

  static fromDB(row: any): TeamMember {
    return new TeamMember(
      row.id,
      row.team_id,
      row.user_id,
      row.role as TeamRole,
      row.joined_at ? new Date(row.joined_at) : new Date()
    );
  }
}