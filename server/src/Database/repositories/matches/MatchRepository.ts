import { IMatchRepository } from "../../../Domain/repositories/matches/IMatchRepository";
import { Match } from "../../../Domain/models/Match";
import { MatchPlayer } from "../../../Domain/models/MatchPlayers";
import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";
import { Result } from "../../../Domain/types/Result";

export class MatchRepository implements IMatchRepository {

  public constructor(
    private readonly db: DbManager,
    private readonly logger: ILoggerService
  ) {}

  async findByTournament(tournamentId: number): Promise<Match[]> {
    const connResult = await this.db.getReadConnection();
    if (!connResult) return [];
    const { conn } = connResult;

    try {
      const [rows] = await conn.execute(
        "SELECT * FROM matches WHERE tournament_id = ? ORDER BY scheduled_at",
        [tournamentId]
      );
      return (rows as any).map((row: any) => Match.fromDB(row));
    } finally {
      conn.release();
    }
  }

  async findById(matchId: number): Promise<Match | null> {
    const connResult = await this.db.getReadConnection();
    if (!connResult) return null;
    const { conn } = connResult;

    try {
      const [rows] = await conn.execute(
        "SELECT * FROM matches WHERE match_id = ?",
        [matchId]
      );
      const row = (rows as any)[0];
      return row ? Match.fromDB(row) : null;
    } finally {
      conn.release();
    }
  }

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

      const matchId = (result as any).insertId;
      const [rows] = await conn.execute("SELECT * FROM matches WHERE match_id = ?", [matchId]);
      return Match.fromDB((rows as any)[0]);
    } finally {
      conn.release();
    }
  }

  async updateResult(matchId: number, result: string): Promise<boolean> {
    const connResult = await this.db.getWriteConnection();
    if (!connResult) return false;
    const { conn } = connResult;

    try {
      const [resultSet] = await conn.execute(
        "UPDATE matches SET result = ? WHERE match_id = ?",
        [result, matchId]
      );
      return (resultSet as any).affectedRows > 0;
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
      return (result as any).affectedRows > 0;
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
      return (rows as any).map((row: any) => MatchPlayer.fromDB(row));
    } finally {
      conn.release();
    }
  }
  
}