import { RowDataPacket, ResultSetHeader } from "mysql2";
import { IMatchRepository } from "../../../Domain/repositories/matches/IMatchRepository";
import { Match } from "../../../Domain/models/Match";
import { User } from "../../../Domain/models/User";
import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";

export class MatchRepository implements IMatchRepository {
  public constructor(
    private readonly db: DbManager,
    private readonly logger: ILoggerService,
  ) {}

  private map(r: RowDataPacket): Match {
    return new Match(
      r.match_id,
      r.tournament_id,
      r.team1_id,
      r.team2_id,
      new Date(r.scheduledAt),
      new Date(r.createdAt),
      new Date(r.updatedAt),
      r.result,
    );
  }

  async findById(id: number): Promise<Match | null> {
    const res = await this.db.getReadConnection();
    if (!res) return null;
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT * FROM matches WHERE match_id = ?`, [id]
      );
      return rows.length > 0 ? this.map(rows[0]) : null;
    } finally {
      res.conn.release();
    }
  }

  async findByTournamentId(tournamentId: number): Promise<Match[]> {
    const res = await this.db.getReadConnection();
    if (!res) return [];
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT * FROM matches WHERE tournament_id = ? ORDER BY round ASC, scheduledAt ASC`,
        [tournamentId]
      );
      return rows.map(r => this.map(r));
    } finally {
      res.conn.release();
    }
  }

  async updateResult(match_id: number, score: string): Promise<boolean> {
  const res = await this.db.getWriteConnection();
  if (!res) return false;
  try {
    // Ovde smo izbacili winner_id i status jer ih nemaš u tabeli
    const [result] = await res.conn.execute<ResultSetHeader>(
      `UPDATE matches SET result = ? WHERE match_id = ?`,
      [score, match_id]
    );
    return result.affectedRows > 0;
  } finally {
    res.conn.release();
  }
}

  async addActivePlayer(matchId: number, userId: number, teamId: number, performanceNotes?: string): Promise<void> {
    const res = await this.db.getWriteConnection();
    if (!res) return;
    try {
      await res.conn.execute(
        `INSERT INTO match_players (match_id, user_id, team_id, performance_notes) VALUES (?, ?, ?, ?)`,
        [matchId, userId, teamId, performanceNotes ?? null]
      );
    } finally {
      res.conn.release();
    }
  }

  async updatePerformanceNotes(matchId: number, userId: number, notes: string): Promise<boolean> {
    const res = await this.db.getWriteConnection();
    if (!res) return false;
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `UPDATE match_players SET performance_notes = ? WHERE match_id = ? AND user_id = ?`,
        [notes, matchId, userId]
      );
      return result.affectedRows > 0;
    } finally {
      res.conn.release();
    }
  }

  async removeActivePlayer(matchId: number, userId: number): Promise<boolean> {
    const res = await this.db.getWriteConnection();
    if (!res) return false;
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `DELETE FROM match_players WHERE match_id = ? AND user_id = ?`,
        [matchId, userId]
      );
      return result.affectedRows > 0;
    } finally {
      res.conn.release();
    }
  }

  async getActivePlayers(matchId: number): Promise<(User & { team_id: number, performance_notes: string | null })[]> {
    const res = await this.db.getReadConnection();
    if (!res) return [];
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT u.*, mp.team_id, mp.performance_notes 
         FROM users u
         JOIN match_players mp ON u.id = mp.user_id
         WHERE mp.match_id = ?`,
        [matchId]
      );
      return rows.map(r => ({
        ...new User(r.id, r.gamer_tag, r.full_name, r.email, r.role, "", r.isActive, r.profile_image, new Date(r.createdAt), new Date(r.updatedAt)),
        team_id: r.team_id,
        performance_notes: r.performance_notes
      }));
    } finally {
      res.conn.release();
    }
  }

  async bulkCreateMatches(matches: Partial<Match>[]): Promise<void> {
  const res = await this.db.getWriteConnection();
  if (!res || matches.length === 0) return;

  try {
   
        const valuesPlaceholder = matches.map(() => `(?, ?, ?, ?)`).join(", ");
    
        const query = `INSERT INTO matches (tournament_id, team1_id, team2_id, scheduledAt) 
                   VALUES ${valuesPlaceholder}`;
    
        const params = matches.flatMap(m => [
            m.tournament_id ?? 0, 
            m.team1_id ?? null, 
            m.team2_id ?? null, 
            m.scheduledAt ?? new Date()
        ]);

        await res.conn.execute(query, params as (number | null | Date)[]);

    } catch (err) {
        this.logger.error("MatchRepository", "bulkCreateMatches failed", err);
    } finally {
        res.conn.release();
    }
 }

}