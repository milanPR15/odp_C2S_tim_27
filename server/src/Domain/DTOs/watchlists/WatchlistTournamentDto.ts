import { TournamentFormat } from "../../enums/TournamentFormat";
import { TournamentStatus } from "../../enums/TournamentStatus";

export class WatchlistTournamentDto {
  constructor(
    public id: number = 0,
    public user_id: number = 0,
    public tournament_id: number = 0,
    public name: string = "",
    public game_id: number = 0,
    public game_title: string = "",
    public game_logo: string = "",
    public format: TournamentFormat = TournamentFormat.SINGLE_ELIMINATION,
    public max_teams: number = 0,
    public entry_deadline: Date = new Date(),
    public prize_pool: number = 0,
    public status: TournamentStatus = TournamentStatus.UPCOMING,
    public added_at: Date = new Date(),
  ) {}
}