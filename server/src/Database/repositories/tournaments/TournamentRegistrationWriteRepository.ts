import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";
import { ITournamentRegistrationWriteRepository } from "../../../Domain/repositories/tournaments/ITournamentRegistrationWriteRepository";
import { TournamentRegistration } from "../../../Domain/models/TournamentRegistration";
import { ResultSetHeader } from "mysql2/promise";

export class TournamentRegistrationWriteRepository implements ITournamentRegistrationWriteRepository {
  constructor(
    private readonly db: DbManager,
    private readonly logger: ILoggerService
  ) {}

  async create(registration: TournamentRegistration): Promise<TournamentRegistration> {
    const connResult = await this.db.getWriteConnection();
    if (!connResult) return new TournamentRegistration();
    const { conn } = connResult;

    try {
      const [result] = await conn.execute<ResultSetHeader>(
        `INSERT INTO tournament_registrations (tournament_id, team_id, selected_player_ids, status, seed)
         VALUES (?, ?, ?, ?, ?)` ,
        [
          registration.tournament_id,
          registration.team_id,
          JSON.stringify(registration.selected_player_ids ?? []),
          registration.status,
          registration.seed ?? 0,
        ]
      );

      if (result.insertId === 0) return new TournamentRegistration();

      const [rows] = await conn.execute(
        `SELECT
           id,
           tournament_id,
           team_id,
           COALESCE(selected_player_ids, '') AS selected_player_ids,
           status,
           COALESCE(seed, 0) AS seed,
           registered_at
         FROM tournament_registrations
         WHERE id = ?
         LIMIT 1`,
        [result.insertId]
      );

      const row = (rows as any)[0];
      return row ? new TournamentRegistration(
        row.id,
        row.tournament_id,
        row.team_id,
        row.status,
        row.seed,
        new Date(row.registered_at),
        row.selected_player_ids === "" ? [] : JSON.parse(row.selected_player_ids)
      ) : new TournamentRegistration();
    } catch (error) {
      this.logger.error("TournamentRegistrationWriteRepository", "create failed", error instanceof Error ? error : String(error));
      return new TournamentRegistration();
    } finally {
      conn.release();
    }
  }

  async updateStatus(id: number, status: any): Promise<boolean> {
    const connResult = await this.db.getWriteConnection();
    if (!connResult) return false;
    const { conn } = connResult;

    try {
      const [result] = await conn.execute<ResultSetHeader>(
        `UPDATE tournament_registrations SET status = ? WHERE id = ?`,
        [status, id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      this.logger.error("TournamentRegistrationWriteRepository", "updateStatus failed", error instanceof Error ? error : String(error));
      return false;
    } finally {
      conn.release();
    }
  }
}
