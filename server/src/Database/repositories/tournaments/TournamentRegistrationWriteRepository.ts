import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";
import { ITournamentRegistrationWriteRepository } from "../../../Domain/repositories/tournaments/ITournamentRegistrationWriteRepository";
import { TournamentRegistration } from "../../../Domain/models/TournamentRegistration";
import { RegistrationStatus } from "../../../Domain/enums/RegistrationStatus";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";

type TournamentRegistrationUserRow = RowDataPacket & {
  user_id: number;
};

type TournamentRegistrationRow = RowDataPacket & {
  id: number;
  tournament_id: number;
  team_id: number;
  status: RegistrationStatus;
  seed: number;
  registered_at: Date | string;
};

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
      await conn.beginTransaction();

      const [result] = await conn.execute<ResultSetHeader>(
        `INSERT INTO tournament_registrations (tournament_id, team_id, status, seed)
         VALUES (?, ?, ?, ?)` ,
        [
          registration.tournament_id,
          registration.team_id,
          registration.status,
          registration.seed ?? 0,
        ]
      );

      if (result.insertId === 0) {
        await conn.rollback();
        return new TournamentRegistration();
      }

      const selectedUserIds = registration.selected_user_ids ?? [];
      if (selectedUserIds.length > 0) {
        const valuesClause = selectedUserIds.map(() => "(?, ?)").join(", ");
        const params = selectedUserIds.flatMap((userId) => [result.insertId, userId]);

        await conn.execute(
          `INSERT INTO tournament_registration_users (tournament_registration_id, user_id)
           VALUES ${valuesClause}`,
          params,
        );
      }

      const [rows] = await conn.execute<TournamentRegistrationRow[]>(
        `SELECT
           id,
           tournament_id,
           team_id,
           status,
           COALESCE(seed, 0) AS seed,
           registered_at
         FROM tournament_registrations
         WHERE id = ?
         LIMIT 1`,
        [result.insertId]
      );

      const [selectedUserRows] = await conn.execute<TournamentRegistrationUserRow[]>(
        `SELECT user_id
           FROM tournament_registration_users
          WHERE tournament_registration_id = ?
          ORDER BY user_id ASC`,
        [result.insertId]
      );

      await conn.commit();

      const row = rows[0];
      return row ? new TournamentRegistration(
        row.id,
        row.tournament_id,
        row.team_id,
        row.status,
        row.seed,
        row.registered_at instanceof Date ? row.registered_at : new Date(row.registered_at),
        selectedUserRows.map((selectedUserRow) => selectedUserRow.user_id)
      ) : new TournamentRegistration();
    } catch (error) {
      await conn.rollback();
      this.logger.error("TournamentRegistrationWriteRepository", "create failed", error instanceof Error ? error : String(error));
      return new TournamentRegistration();
    } finally {
      conn.release();
    }
  }

  async updateStatus(id: number, status: RegistrationStatus): Promise<boolean> {
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
