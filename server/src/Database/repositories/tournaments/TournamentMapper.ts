import { RowDataPacket } from "mysql2";
import { Tournament } from "../../../Domain/models/Tournament";

export class TournamentMapper {
  static fromRow(row: RowDataPacket): Tournament {
    return new Tournament(
      row.tournament_id,
      row.name,
      row.game_id,
      row.format,
      row.max_teams,
      row.entry_deadline,
      row.prize_pool,
      row.status,
      row.created_at,
      row.updated_at
    );
  }
}