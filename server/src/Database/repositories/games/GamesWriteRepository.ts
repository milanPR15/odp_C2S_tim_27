import { DbManager } from "../../connection/DbConnectionPool";
import { Game } from "../../../Domain/models/Game";
import { ResultSetHeader } from "mysql2";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";
import { IGamesWriteRepository } from "../../../Domain/repositories/games/IGamesWriteRepository";

export class GameWriteRepository implements IGamesWriteRepository{
  constructor(private readonly db: DbManager, private readonly logger: ILoggerService) {}

  async create(game: Game): Promise<Game | null> {
    const res = await this.db.getWriteConnection();
    if (!res) return null;
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `INSERT INTO games (title, genre, max_players, logo) VALUES (?, ?, ?, ?)`,
        [game.title, game.genre, game.max_players, game.logo]
      );
      if (result.insertId === 0) return null;
      return new Game(result.insertId, game.title, game.genre, game.max_players, game.logo);
    } catch (err) {
      this.logger.error("GameWriteRepository", "create failed", err);
      return null;
    } finally {
      res.conn.release();
    }
  }

  async update(game: Game): Promise<boolean> {
        const res = await this.db.getWriteConnection();
        if (!res) return false;
        try {
            const [result] = await res.conn.execute<ResultSetHeader>(
                `UPDATE games SET title = ?, genre = ?, max_players = ?, logo = ? WHERE game_id = ?`,
                [game.title, game.genre, game.max_players, game.logo, game.game_id]
            );
            return result.affectedRows > 0;
        } catch (err) {
            this.logger.error("GamesWriteRepository", "update failed", err);
            return false;
        }
        finally { res.conn.release(); }
    }


  async delete(id: number): Promise<boolean> {
        const res = await this.db.getWriteConnection();
        if (!res) return false;
        try {
            const [result] = await res.conn.execute<ResultSetHeader>(`DELETE FROM games WHERE game_id = ?`, [id]);
            return result.affectedRows > 0;
        } catch (err) {
            this.logger.error("GamesEriteRepository", "delete failed", err);
            return false;
        }
        finally { res.conn.release(); }
    }

}