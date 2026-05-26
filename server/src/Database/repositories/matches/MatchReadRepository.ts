import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";
import { Match, MatchRow } from "../../../Domain/models/Match";
import { MatchPlayer } from "../../../Domain/models/MatchPlayers";
import { RowDataPacket } from "mysql2";
import { IMatchReadRepository } from "../../../Domain/repositories/matches/IMatchReadRepository";

export class MatchReadRepository implements IMatchReadRepository{
  constructor(private readonly db: DbManager, 
    private readonly logger: ILoggerService
) {}

  async findByTournament(tournamentId: number): Promise<Match[]> {
    const res = await this.db.getReadConnection();
    if (!res) return [];
    try {
      const [rows] = await res.conn.execute("SELECT * FROM matches WHERE tournament_id = ? ORDER BY scheduled_at", [tournamentId]);
      return (rows as MatchRow[]).map(Match.fromDB);
    } finally {
      res.conn.release();
    }
  }

  async findById(matchId: number): Promise<Match> {
    const connResult = await this.db.getReadConnection();
    if (!connResult) return new Match();
    const { conn } = connResult;

    try {
      const [rows] = await conn.execute(
        "SELECT * FROM matches WHERE match_id = ?",
        [matchId]
      );
      const row = (rows as MatchRow[])[0];
      return row ? Match.fromDB(row) : new Match();
    } finally {
      conn.release();
    }
  }

  async findPlayers(matchId: number): Promise<MatchPlayer[]> {
    const connResult = await this.db.getReadConnection();
    if (!connResult) return [];
    const { conn } = connResult;

    try {
      const [rows] = await conn.execute(
        "SELECT * FROM match_players WHERE match_id = ?",
        [matchId]
      );
      return (rows as RowDataPacket[]).map((row) => MatchPlayer.fromDB(row));
    } finally {
      conn.release();
    }
  }
  

  async isCaptainOfTeamInMatch(matchId: number, captainId: number): Promise<boolean> {
    const connResult = await this.db.getReadConnection();
    if (!connResult) return false;
    const { conn } = connResult;

    try {
      const [rows] = await conn.execute<RowDataPacket[]>(
        `SELECT 1 FROM match_players WHERE match_id = ? AND user_id = ? LIMIT 1`,
        [matchId, captainId]
      );
      return rows.length > 0;
    } finally {
      conn.release();
    }
  }

   async isPlayerInMatchTeam(matchId: number, userId: number): Promise<boolean> {
    const connResult = await this.db.getReadConnection();
    if (!connResult) return false;
    const { conn } = connResult;

    try {
      const [rows] = await conn.execute<RowDataPacket[]>(`
        SELECT EXISTS(
          SELECT 1
          FROM match_players
          WHERE match_id = ?
            AND user_id = ?
        ) AS found
      `, [matchId, userId]);

      return rows[0]?.found === 1;
    } finally {
      conn.release();
    }
  }

  async getPlayerTeam(matchId: number, userId: number): Promise<number> {
    const connResult = await this.db.getReadConnection();
    if (!connResult) return 0;
    const { conn } = connResult;

    try {
      const [rows] = await conn.execute<RowDataPacket[]>(
        `SELECT team_id FROM match_players WHERE match_id = ? AND user_id = ? LIMIT 1`,
        [matchId, userId]
      );
      const row = (rows as RowDataPacket[])[0];
      return row ? Number(row.team_id) : 0;
    } finally {
      conn.release();
    }
  }
}