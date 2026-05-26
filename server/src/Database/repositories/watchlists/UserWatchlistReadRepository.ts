import { RowDataPacket } from "mysql2/promise";
import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";
import { IUserWatchlistReadRepository } from "../../../Domain/repositories/watchlists/IUserWatchlistReadRepository";
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

export class UserWatchlistReadRepository implements IUserWatchlistReadRepository {
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
      const [rows] = await conn.execute<RowDataPacket[]>(
        `SELECT id, user_id, tournament_id, added_at FROM user_watchlist WHERE user_id = ? ORDER BY added_at DESC`,
        [userId]
      );

      return (rows as any).map((r: any) => ({ id: r.id, user_id: r.user_id, tournament_id: r.tournament_id, added_at: r.added_at }));
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
