import { ResultSetHeader } from "mysql2/promise";
import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";
import { IUserWatchlistWriteRepository } from "../../../Domain/repositories/watchlists/IUserWatchlistWriteRepository";

export class UserWatchlistWriteRepository implements IUserWatchlistWriteRepository {
  constructor(
    private readonly db: DbManager,
    private readonly logger: ILoggerService,
  ) {}

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
      this.logger.error("UserWatchlistWriteRepository", "create failed", error instanceof Error ? error : String(error));
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
      this.logger.error("UserWatchlistWriteRepository", "delete failed", error instanceof Error ? error : String(error));
      return false;
    } finally {
      conn.release();
    }
  }
}
