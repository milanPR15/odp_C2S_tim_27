import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";
import { IUserWatchlistRepository } from "../../../Domain/repositories/watchlists/IUserWatchlistRepository";
import { WatchlistTournamentDto } from "../../../Domain/DTOs/watchlists/WatchlistTournamentDto";
import { TournamentFormat } from "../../../Domain/enums/TournamentFormat";
import { TournamentStatus } from "../../../Domain/enums/TournamentStatus";

type WatchlistTournamentRow = RowDataPacket & {
  id: number;
  user_id: number;
  tournament_id: number;
  name: string;
  game_id: number;
  game_title: string;
  game_logo: string;
  format: string;
  max_teams: number;
  entry_deadline: Date | string;
  prize_pool: number;
  status: string;
  added_at: Date | string;
};

export class UserWatchlistRepository implements IUserWatchlistRepository {
  constructor(
    private readonly db: DbManager,
    private readonly logger: ILoggerService,
  ) {}

  private fromRow(row: WatchlistTournamentRow): WatchlistTournamentDto {
    return new WatchlistTournamentDto(
      row.id,
      row.user_id,
      row.tournament_id,
      row.name,
      row.game_id,
      row.game_title,
      row.game_logo,
      row.format as TournamentFormat,
      row.max_teams,
      row.entry_deadline instanceof Date ? row.entry_deadline : new Date(row.entry_deadline),
      row.prize_pool,
      row.status as TournamentStatus,
      row.added_at instanceof Date ? row.added_at : new Date(row.added_at),
    );
  }

  async findByUserId(userId: number): Promise<WatchlistTournamentDto[]> {
    const connResult = await this.db.getReadConnection();
    if (!connResult) return [];
    const { conn } = connResult;

    try {
      const [rows] = await conn.execute<WatchlistTournamentRow[]>(
        `SELECT
           uw.id,
           uw.user_id,
           uw.tournament_id,
           COALESCE((SELECT t.name FROM tournaments t WHERE t.tournament_id = uw.tournament_id LIMIT 1), '') AS name,
           COALESCE((SELECT t.game_id FROM tournaments t WHERE t.tournament_id = uw.tournament_id LIMIT 1), 0) AS game_id,
           COALESCE((SELECT title FROM games WHERE game_id = (SELECT game_id FROM tournaments WHERE tournament_id = uw.tournament_id LIMIT 1) LIMIT 1), '') AS game_title,
           COALESCE((SELECT logo FROM games WHERE game_id = (SELECT game_id FROM tournaments WHERE tournament_id = uw.tournament_id LIMIT 1) LIMIT 1), '') AS game_logo,
           COALESCE((SELECT t.format FROM tournaments t WHERE t.tournament_id = uw.tournament_id LIMIT 1), 'single_elimination') AS format,
           COALESCE((SELECT t.max_teams FROM tournaments t WHERE t.tournament_id = uw.tournament_id LIMIT 1), 0) AS max_teams,
           COALESCE((SELECT t.entry_deadline FROM tournaments t WHERE t.tournament_id = uw.tournament_id LIMIT 1), CURRENT_TIMESTAMP) AS entry_deadline,
           COALESCE((SELECT t.prize_pool FROM tournaments t WHERE t.tournament_id = uw.tournament_id LIMIT 1), 0) AS prize_pool,
           COALESCE((SELECT t.status FROM tournaments t WHERE t.tournament_id = uw.tournament_id LIMIT 1), 'upcoming') AS status,
           uw.added_at
         FROM user_watchlist uw
         WHERE uw.user_id = ?
         ORDER BY uw.added_at DESC, name ASC`,
        [userId],
      );

      return rows.map((row) => this.fromRow(row));
    } catch (error) {
      this.logger.error("UserWatchlistRepository", "findByUserId failed", error instanceof Error ? error : String(error));
      return [];
    } finally {
      conn.release();
    }
  }

  async exists(userId: number, tournamentId: number): Promise<boolean> {
    const connResult = await this.db.getReadConnection();
    if (!connResult) return false;
    const { conn } = connResult;

    try {
      const [rows] = await conn.execute<RowDataPacket[]>(
        `SELECT COUNT(*) AS count FROM user_watchlist WHERE user_id = ? AND tournament_id = ?`,
        [userId, tournamentId],
      );

      return Number(rows[0]?.count ?? 0) > 0;
    } catch (error) {
      this.logger.error("UserWatchlistRepository", "exists failed", error instanceof Error ? error : String(error));
      return false;
    } finally {
      conn.release();
    }
  }

  async create(userId: number, tournamentId: number): Promise<boolean> {
    const connResult = await this.db.getWriteConnection();
    if (!connResult) return false;
    const { conn } = connResult;

    try {
      const [result] = await conn.execute<ResultSetHeader>(
        `INSERT INTO user_watchlist (user_id, tournament_id) VALUES (?, ?)` ,
        [userId, tournamentId],
      );

      return result.affectedRows > 0;
    } catch (error) {
      this.logger.error("UserWatchlistRepository", "create failed", error instanceof Error ? error : String(error));
      return false;
    } finally {
      conn.release();
    }
  }

  async delete(userId: number, tournamentId: number): Promise<boolean> {
    const connResult = await this.db.getWriteConnection();
    if (!connResult) return false;
    const { conn } = connResult;

    try {
      const [result] = await conn.execute<ResultSetHeader>(
        `DELETE FROM user_watchlist WHERE user_id = ? AND tournament_id = ?`,
        [userId, tournamentId],
      );

      return result.affectedRows > 0;
    } catch (error) {
      this.logger.error("UserWatchlistRepository", "delete failed", error instanceof Error ? error : String(error));
      return false;
    } finally {
      conn.release();
    }
  }
}