import { RowDataPacket } from "mysql2";
import { Game } from "../../../Domain/models/Game";

export class GamesMapper {
  static fromRow(r: RowDataPacket): Game {
    return new Game(
      r.game_id,
      r.title,
      r.genre,
      r.max_players,
      r.logo,
      new Date(r.created_at),
      new Date(r.updated_at)
    );
  }
}