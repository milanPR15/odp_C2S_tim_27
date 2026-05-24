import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";
import { Tournament } from "../../../Domain/models/Tournament";
import { ResultSetHeader } from "mysql2/promise";
import { ITournamentWriteRepository } from "../../../Domain/repositories/tournaments/ITournamentWriteRepository";

export class TournamentWriteRepository implements ITournamentWriteRepository{
  constructor(
    private readonly db: DbManager,
    private readonly logger: ILoggerService
  ) {}

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


  async update(tournament?: Tournament): Promise<boolean> {
        if (!tournament) return false;
        const res = await this.db.getWriteConnection();
        if (!res) return false;
        try {
            const [result] = await res.conn.execute<ResultSetHeader>(
                `UPDATE tournaments SET name = ?, game_id = ?, format = ?, max_teams = ?, entry_deadline = ?, prize_pool = ?, status = ? WHERE tournament_id = ?`,
                [tournament.name, tournament.game_id, tournament.format, tournament.max_teams, tournament.entry_deadline, tournament.prize_pool, tournament.status, tournament.tournament_id]
            );
            return result.affectedRows > 0;
        } catch (err) {
            this.logger.error('Trounament repository', "update failed", err);
            return false;
        }
        finally { res.conn.release(); }
    }


  async delete(id: number): Promise<boolean> {
        const res = await this.db.getWriteConnection();
        if (!res) return false;
        try {
            const [result] = await res.conn.execute<ResultSetHeader>(
                `DELETE FROM tournaments WHERE tournament_id = ?`,
                [id]
            );
            return result.affectedRows > 0;
        } catch (err) {
            this.logger.error('Trounament repository', "delete failed", err);
            return false;
        }
        finally { res.conn.release(); }
    }

}