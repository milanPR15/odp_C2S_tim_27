import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";
import { Tournament } from "../../../Domain/models/Tournament";
import { RowDataPacket } from "mysql2";
import { TournamentMapper } from "./TournamentMapper";
import { ITournamentReadRepository } from "../../../Domain/repositories/tournaments/ITournamentReadRepository";

export class TournamentReadRepository implements ITournamentReadRepository {
  constructor(
    private readonly db: DbManager,
    private readonly logger: ILoggerService
  ) {}

  async findById(id: number): Promise<Tournament | null> {
        const res = await this.db.getReadConnection();
        if (!res) return null;
        try {
            const [rows] = await res.conn.execute<RowDataPacket[]>(
                `SELECT * FROM tournaments WHERE tournament_id = ?`,
                [id]
            );
            return rows.length > 0 ? TournamentMapper.fromRow(rows[0]) : null;
        } catch (err) {
            this.logger.error('Trounament repository', "findById failed", err);
            return null;
        }
        finally { res.conn.release(); }
    }

  async findByGameId(gameId: number): Promise<Tournament[]> {
        const res = await this.db.getReadConnection();
        if (!res) return [];
        try {
            const [rows] = await res.conn.execute<RowDataPacket[]>(
                `SELECT * FROM tournaments WHERE game_id = ?`,
                [gameId]
            );
            return rows.map(r => TournamentMapper.fromRow(r));
        } catch (err) {
            this.logger.error('Tournament repository', "findByGameId failed", err);
            return [];
        }
        finally { res.conn.release(); }
    }

  async findByName(name: string): Promise<Tournament> {
        const res = await this.db.getReadConnection();
        if (!res) return new Tournament();
        try {
            const [rows] = await res.conn.execute<RowDataPacket[]>(
                `SELECT * FROM tournaments WHERE name = ? LIMIT 1`,
                [name]
            );
            return rows.length > 0 ? TournamentMapper.fromRow(rows[0]) : new Tournament();
        } catch (err) {
            this.logger.error('Trounament repository', "findByName failed", err);
            return new Tournament();
        }
        finally { res.conn.release(); }
    }

  async findAll(): Promise<Tournament[]> {
        const res = await this.db.getReadConnection();
        if (!res) return [];
        try {
            const [rows] = await res.conn.execute<RowDataPacket[]>(
                `SELECT * FROM tournaments`
            );
            return rows.map(r => TournamentMapper.fromRow(r));
        } catch (err) {
            this.logger.error('Trounament repository', "findAll failed", err);
            return [];
        }
        finally { res.conn.release(); }
    }
}