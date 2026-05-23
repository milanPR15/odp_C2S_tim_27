export class RegisterTournamentTeamDto {
  constructor(
    public teamId: number = 0,
    public playerIds: number[] = [],
  ) {}

  isValid(): boolean {
    return Number.isInteger(this.teamId) && this.teamId > 0 && Array.isArray(this.playerIds);
  }
}