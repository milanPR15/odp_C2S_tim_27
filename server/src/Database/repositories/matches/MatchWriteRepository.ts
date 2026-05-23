import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";
import { Match, MatchRow } from "../../../Domain/models/Match";
import { ResultSetHeader } from "mysql2/promise";

export class MatchWriteRepository {
  constructor(private readonly db: DbManager, 
    private readonly logger: ILoggerService
) {}

async create(match: Omit<Match, 'match_id' | 'createdAt' | 'updatedAt'>): Promise<Match> {
    const connResult = await this.db.getWriteConnection();
    if (!connResult) throw new Error("No database connection available");
    const { conn } = connResult;

    try {
      const [result] = await conn.execute(
        `INSERT INTO matches (tournament_id, team1_id, team2_id, scheduled_at, result)
         VALUES (?, ?, ?, ?, ?)`,
        [match.tournament_id, match.team1_id, match.team2_id, match.scheduled_at, match.result]
      );

      const matchId = (result as ResultSetHeader).insertId;
      const [rows] = await conn.execute("SELECT * FROM matches WHERE match_id = ?", [matchId]);
      return Match.fromDB((rows as MatchRow[])[0]);
    } finally {
      conn.release();
    }
  }

async updateResult(matchId: number, result: string, winnerTeamId: number): Promise<boolean> {
  
    const connResult = await this.db.getWriteConnection();
    if (!connResult) {
      return false;
    }

    const { conn } = connResult;
    try {
      const [resultSet] = await conn.execute(
        `UPDATE matches
        SET result = ?,
            winner_team_id = ?,
            status = 'completed'
        WHERE match_id = ?`,
        [result, winnerTeamId, matchId]
      );
      return (resultSet as ResultSetHeader).affectedRows > 0;
    } finally {
      conn.release();
    }
  }

async addPlayer(matchId: number, userId: number, teamId: number, performanceNotes?: string): Promise<boolean> {
    const connResult = await this.db.getWriteConnection();
    if (!connResult) return false;
    const { conn } = connResult;

    try {
      await conn.execute(
        `INSERT INTO match_players (match_id, user_id, team_id, performance_notes)
         VALUES (?, ?, ?, ?)`,
        [matchId, userId, teamId, performanceNotes || null]
      );
      return true;
    } finally {
      conn.release();
    }
  }
    
async removePlayer(matchId: number, userId: number): Promise<boolean> {
    const connResult = await this.db.getWriteConnection();
    if (!connResult) return false;
    const { conn } = connResult;

    try {
      const [result] = await conn.execute(
        "DELETE FROM match_players WHERE match_id = ? AND user_id = ?",
        [matchId, userId]
      );
      return (result as ResultSetHeader).affectedRows > 0;
    } finally {
      conn.release();
    }
  }

    async advanceWinnerToNextMatch(nextMatchId: number, slot: 'team1' | 'team2', winnerTeamId: number): Promise<boolean> {
        const dbConn = await this.db.getWriteConnection();
        if (!dbConn) return false;
        const { conn } = dbConn;

        try {
            const column = slot === 'team1' ? 'team1_id' : 'team2_id';
            const [result] = await conn.execute(
                `UPDATE matches
                SET ${column} = ?
                WHERE match_id = ?`,
                [winnerTeamId, nextMatchId]
            );
            return (result as ResultSetHeader).affectedRows > 0;
        } catch (err) {
            console.error(err);
            return false;
        } finally {
            conn.release();
        }
    }
}