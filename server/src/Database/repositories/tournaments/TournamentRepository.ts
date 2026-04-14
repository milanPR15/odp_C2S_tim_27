import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { Tournament } from '../../../Domain/models/Tournament';
import { ITournamentRepository } from '../../../Domain/repositories/tournaments/ITournamentRepository';
import { ILoggerService } from '../../../Domain/services/logger/ILoggerService';
import { DbManager } from '../../connection/DbConnectionPool';

export class TournamentRepository implements ITournamentRepository {
    public constructor(
        private readonly db: DbManager,
        private readonly logger: ILoggerService,
    ) {}

    private map(r: RowDataPacket): Tournament {
        return new Tournament(r.tournament_id, r.name, r.game_id, r.format, r.max_teams, r.entry_deadline, r.prize_pool, r.status, r.createdAt, r.updatedAt);
    }
    async create(tournament: Tournament): Promise<Tournament> {
        const res = await this.db.getWriteConnection();
        if (!res) return new Tournament();
        try {
            const [result] = await res.conn.execute<ResultSetHeader>(
                `INSERT INTO tournaments (name, game_id, format, max_teams, entry_deadline, prize_pool, status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [tournament.name, tournament.game_id, tournament.format, tournament.max_teams, tournament.entry_deadline, tournament.prize_pool, tournament.status]
            );
            if (result.insertId === 0) return new Tournament();
            return new Tournament(result.insertId, tournament.name, tournament.game_id, tournament.format, tournament.max_teams, tournament.entry_deadline, tournament.prize_pool, tournament.status);
        } catch (err) {
            this.logger.error('Trounament repository', "create failed", err);
            return new Tournament();
        }
        finally { res.conn.release(); }
    }
    findById(id: number): Promise<Tournament | null> {
        throw new Error('Method not implemented.');
    }
    async findByName(name: string): Promise<Tournament> {
        const res = await this.db.getReadConnection();
        if (!res) return new Tournament();
        try {
            const [rows] = await res.conn.execute<RowDataPacket[]>(
                `SELECT * FROM tournaments WHERE name = ? LIMIT 1`,
                [name]
            );
            return rows.length > 0 ? this.map(rows[0]) : new Tournament();
        } catch (err) {
            this.logger.error('Trounament repository', "findByName failed", err);
            return new Tournament();
        }
        finally { res.conn.release(); }
    }
    findAll(): Promise<Tournament[]> {
        throw new Error('Method not implemented.');
    }
    update(tournament?: Tournament): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
    delete(id: number): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
}
  