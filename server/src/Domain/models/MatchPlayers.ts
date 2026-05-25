import { RowDataPacket } from "mysql2/promise";

export class MatchPlayer {
  constructor(
    public id: number = 0,
    public match_id: number = 0,
    public user_id: number = 0,
    public team_id: number = 0,
    public performance_notes: string | null = null
  ) {}

  static fromDB(row: RowDataPacket): MatchPlayer {
    return new MatchPlayer(
      row.id,
      row.match_id,
      row.user_id,
      row.team_id,
      row.performance_notes
    );
  }
}