export class UpdateMatchResultDto {
  constructor(
    public result: string,           
    public winner_team_id?: number   
  ) {}

  isValid(): boolean {
    return /^\d+:\d+$/.test(this.result.trim());
  }
}