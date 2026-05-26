import { RowDataPacket } from "mysql2/promise";
import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";
import { IUserWatchlistReadRepository } from "../../../Domain/repositories/watchlists/IUserWatchlistReadRepository";
import { UserWatchlist } from "../../../Domain/models/UserWatchlist";

type WatchlistEntryRow = RowDataPacket & {
  id: number;
  user_id: number;
  tournament_id: number;
  added_at: Date | string;
};

export class UserWatchlistReadRepository implements IUserWatchlistReadRepository {
  constructor(
    private readonly db: DbManager,
    private readonly logger: ILoggerService,
  ) {}

  private fromRow(row: WatchlistEntryRow): UserWatchlist {
    return new UserWatchlist(
      row.id,
      row.user_id,
      row.tournament_id,
      row.added_at instanceof Date ? row.added_at : new Date(row.added_at),
    );
  }

  async findByUserId(userId: number): Promise<UserWatchlist[]> {
    const connResult = await this.db.getReadConnection();
    if (!connResult) return [];
    const { conn } = connResult;

    try {
      const [rows] = await conn.execute<WatchlistEntryRow[]>(
        `SELECT id, user_id, tournament_id, added_at FROM user_watchlist WHERE user_id = ? ORDER BY added_at DESC`,
        [userId]
      );

      return rows.map((row) => this.fromRow(row));
    } catch (error) {
      this.logger.error("UserWatchlistReadRepository", "findByUserId failed", error instanceof Error ? error : String(error));
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
      this.logger.error("UserWatchlistReadRepository", "exists failed", error instanceof Error ? error : String(error));
      return false;
    } finally {
      conn.release();
    }
  }
}
