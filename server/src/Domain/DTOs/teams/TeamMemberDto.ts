import { TeamRole } from "../../enums/TeamRole";

export class TeamMemberDto {
  constructor(
    public user_id: number,
    public gamer_tag: string,
    public full_name: string,
    public role: TeamRole,
    public joined_at: Date
  ) {}
}