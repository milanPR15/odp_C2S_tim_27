import { TeamMemberDto } from "./TeamMemberDto";

export class TeamDto {
  constructor(
    public team_id: number,
    public team_name: string,
    public tag: string,
    public logo: string,
    public description: string | null,
    public captain_id: number,           
    public captain_gamer_tag: string,    
    public members_count: number,
    public created_at: Date, 
  ) {}
}