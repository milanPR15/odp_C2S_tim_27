import { TournamentFormat } from "../../enums/TournamentFormat";
import { TournamentStatus } from "../../enums/TournamentStatus";

export class TournamentDto {
  constructor(
    public tournament_id: number = 0,
    public name: string = "",
    public game_id: number = 0,
    public format: TournamentFormat = TournamentFormat.SINGLE_ELIMINATION,
    public max_teams: number = 0,
    public entry_deadline: Date = new Date(),
    public prize_pool: number = 0,
    public status: TournamentStatus = TournamentStatus.UPCOMING,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) {}
}