export class MatchPlayerDto {
  constructor(
    public user_id: number,
    public gamer_tag: string,
    public full_name: string,
    public team_id: number,
    public performance_notes: string
  ) {}
}