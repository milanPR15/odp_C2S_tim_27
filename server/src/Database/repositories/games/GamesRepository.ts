import { RowDataPacket, ResultSetHeader } from "mysql2";
import { Game } from "../../../Domain/models/Game";
import { IGamesRepository } from "../../../Domain/repositories/games/IGamesRepository";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";
import { DbManager } from "../../connection/DbConnectionPool";

export class GamesRepository implements IGamesRepository {
    constructor(
        private readonly db: DbManager,
        private readonly logger: ILoggerService
    ) {}
    async getById(id: number): Promise<Game | null> {
        const res = await this.db.getReadConnection();
        if (!res) return null;
        try {
            const [rows] = await res.conn.execute<RowDataPacket[]>(
                `SELECT * FROM games WHERE game_id = ?`,
                [id]
            );
            return rows.length > 0 ? this.map(rows[0]) : null;
        } catch (err) {
            this.logger.error("GamesRepository", "getById failed", err);
            return null;
        }
        finally { res.conn.release(); }
    }
    async getByName(name: string): Promise<Game | null> {
        const res = await this.db.getReadConnection();
        if (!res) return null;
        try {
            const [rows] = await res.conn.execute<RowDataPacket[]>(
                `SELECT * FROM games WHERE title = ?`,
                [name]
            );
            return rows.length > 0 ? this.map(rows[0]) : null;
        } catch (err) {
            this.logger.error("GamesRepository", "getByName failed", err);
            return null;
        }
        finally { res.conn.release(); }
    }
    async getAll(): Promise<Game[]> {
        const res = await this.db.getReadConnection();
        if (!res) return [];
        try {
            const [rows] = await res.conn.execute<RowDataPacket[]>(`SELECT * FROM games`);
            return rows.map((r: RowDataPacket) => this.map(r));
        } catch (err) {
            this.logger.error("GamesRepository", "getAll failed", err);
            return [];
        }
        finally { res.conn.release(); }
    }

    private map(r: RowDataPacket): Game {
        return new Game(r.game_id, r.title, r.genre, r.max_players, r.logo, r.createdAt, r.updatedAt);
    }

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
            this.logger.error("GamesRepository", "create failed", err);
            return null;
        }
        finally { res.conn.release(); }
    }
    async findById(id: number): Promise<Game | null> {
        const res = await this.db.getReadConnection();
        if (!res) return null;
        try {
            const [rows] = await res.conn.execute<RowDataPacket[]>(
                `SELECT * FROM games WHERE game_id = ?`,
                [id]
            );
            return rows.length > 0 ? this.map(rows[0]) : null;
        } catch (err) {
            this.logger.error("GamesRepository", "findById failed", err);
            return null;
        }
        finally { res.conn.release(); }
    }
    async findByName(name: string): Promise<Game | null> {
        const res = await this.db.getReadConnection();
        if (!res) return null;
        try {
            const [rows] = await res.conn.execute<RowDataPacket[]>(
                `SELECT * FROM games WHERE title = ?`,
                [name]
            );
            return rows.length > 0 ? this.map(rows[0]) : null;
        } catch (err) {
            this.logger.error("GamesRepository", "findByName failed", err);
            return null;
        }
        finally { res.conn.release(); }
    }
    async findAll(): Promise<Game[]> {
        const res = await this.db.getReadConnection();
        if (!res) return [];
        try {
            const [rows] = await res.conn.execute<RowDataPacket[]>(`SELECT * FROM games`);
            return rows.map((r: RowDataPacket) => this.map(r));
        } catch (err) {
            this.logger.error("GamesRepository", "findAll failed", err);
            return [];
        }
        finally { res.conn.release(); }
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
            this.logger.error("GamesRepository", "update failed", err);
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
            this.logger.error("GamesRepository", "delete failed", err);
            return false;
        }
        finally { res.conn.release(); }
    }
}