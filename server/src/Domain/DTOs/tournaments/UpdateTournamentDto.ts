import { TournamentFormat } from "../../enums/TournamentFormat";
import { TournamentStatus } from "../../enums/TournamentStatus";

export class UpdateTournamentDto {
  constructor(
    public name?: string,
    public game_id?: number,
    public format?: TournamentFormat,
    public max_teams?: number,
    public entry_deadline?: Date,
    public prize_pool?: number,
    public status?: TournamentStatus,
  ) {}
}