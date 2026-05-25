export class CreateTeamDto {
  constructor(
    public team_name: string,
    public tag: string,
    public logo: string = "",
    public description: string = "",
    public captan_id: number
  ) {}

  isValid(): boolean {
    return (
      this.team_name.trim().length >= 2 &&
      this.team_name.trim().length <= 50 &&
      this.tag.trim().length >= 2 &&
      this.tag.trim().length <= 6 &&
      /^[A-Z0-9]+$/.test(this.tag.trim())
    );
  }
}