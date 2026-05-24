import { DbManager } from "../../connection/DbConnectionPool";
import { Game } from "../../../Domain/models/Game";
import { GamesMapper } from "./GamesMapper";
import { RowDataPacket } from "mysql2";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";
import { IGamesReadRepository } from "../../../Domain/repositories/games/IGamesReadRepository";

export class GameReadRepository implements IGamesReadRepository{
  constructor(private readonly db: DbManager, private readonly logger: ILoggerService) {}

  async getById(id: number): Promise<Game | null> {
    const res = await this.db.getReadConnection();
    if (!res) return null;
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT * FROM games WHERE game_id = ?`,
        [id]
      );
      return rows.length > 0 ? GamesMapper.fromRow(rows[0]) : null;
    } catch (err) {
      this.logger.error("GameReadRepository", "getById failed", err);
      return null;
    } finally {
      res.conn.release();
    }
  }

  async getByName(name: string): Promise<Game | null> {
        const res = await this.db.getReadConnection();
        if (!res) return null;
        try {
            const [rows] = await res.conn.execute<RowDataPacket[]>(
                `SELECT * FROM games WHERE title = ?`,
                [name]
            );
            return rows.length > 0 ? GamesMapper.fromRow(rows[0]) : null;
        } catch (err) {
            this.logger.error("GameReadRepository", "findByName failed", err);
            return null;
        }
        finally { res.conn.release(); }
    }

  async getAll(): Promise<Game[]> {
        const res = await this.db.getReadConnection();
        if (!res) return [];
        try {
            const [rows] = await res.conn.execute<RowDataPacket[]>(`SELECT * FROM games`);
            return rows.map((r: RowDataPacket) => GamesMapper.fromRow(r));
        } catch (err) {
            this.logger.error("GameReadRepository", "findAll failed", err);
            return [];
        }
        finally { res.conn.release(); }
    }

}