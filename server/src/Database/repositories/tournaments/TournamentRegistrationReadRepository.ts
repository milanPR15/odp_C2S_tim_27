import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";
import { ITournamentRegistrationReadRepository } from "../../../Domain/repositories/tournaments/ITournamentRegistrationReadRepository";
import { TournamentRegistration } from "../../../Domain/models/TournamentRegistration";
import { RegistrationStatus } from "../../../Domain/enums/RegistrationStatus";
import { PoolConnection, RowDataPacket } from "mysql2/promise";

type TournamentRegistrationRow = RowDataPacket & {
  id: number;
  tournament_id: number;
  team_id: number;
  status: string;
  seed: number;
  registered_at: Date | string;
};

type TournamentRegistrationUserRow = RowDataPacket & {
  tournament_registration_id: number;
  user_id: number;
};

export class TournamentRegistrationReadRepository implements ITournamentRegistrationReadRepository {
  constructor(
    private readonly db: DbManager,
    private readonly logger: ILoggerService
  ) {}

  private fromRow(row: TournamentRegistrationRow, selectedUserIds: number[] = []): TournamentRegistration {
    return new TournamentRegistration(
      row.id,
      row.tournament_id,
      row.team_id,
      row.status as RegistrationStatus,
      row.seed ?? 0,
      row.registered_at instanceof Date ? row.registered_at : new Date(row.registered_at),
      selectedUserIds
    );
  }

  private async loadSelectedUsersByRegistrationIds(
    conn: PoolConnection,
    registrationIds: number[]
  ): Promise<Map<number, number[]>> {
    const selectedUsersByRegistrationId = new Map<number, number[]>();
    if (registrationIds.length === 0) return selectedUsersByRegistrationId;

    const placeholders = registrationIds.map(() => "?").join(", ");
    const [rows] = await conn.execute<TournamentRegistrationUserRow[]>(
      `SELECT tournament_registration_id, user_id
         FROM tournament_registration_users
        WHERE tournament_registration_id IN (${placeholders})
        ORDER BY tournament_registration_id ASC, user_id ASC`,
      registrationIds,
    );

    for (const row of rows) {
      const current = selectedUsersByRegistrationId.get(row.tournament_registration_id) ?? [];
      current.push(row.user_id);
      selectedUsersByRegistrationId.set(row.tournament_registration_id, current);
    }

    return selectedUsersByRegistrationId;
  }

  async findById(id: number): Promise<TournamentRegistration> {
    const connResult = await this.db.getReadConnection();
    if (!connResult) return new TournamentRegistration();
    const { conn } = connResult;

    try {
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
        [id]
      );

      if (!rows[0]) return new TournamentRegistration();

      const selectedUsersByRegistrationId = await this.loadSelectedUsersByRegistrationIds(conn, [rows[0].id]);
      return this.fromRow(rows[0], selectedUsersByRegistrationId.get(rows[0].id) ?? []);
    } catch (error) {
      this.logger.error("TournamentRegistrationReadRepository", "findById failed", error instanceof Error ? error : String(error));
      return new TournamentRegistration();
    } finally {
      conn.release();
    }
  }

  async findByTournamentAndTeam(tournamentId: number, teamId: number): Promise<TournamentRegistration> {
    const connResult = await this.db.getReadConnection();
    if (!connResult) return new TournamentRegistration();
    const { conn } = connResult;

    try {
      const [rows] = await conn.execute<TournamentRegistrationRow[]>(
        `SELECT
           id,
           tournament_id,
           team_id,
           status,
           COALESCE(seed, 0) AS seed,
           registered_at
         FROM tournament_registrations
         WHERE tournament_id = ? AND team_id = ?
         LIMIT 1`,
        [tournamentId, teamId]
      );

      if (!rows[0]) return new TournamentRegistration();

      const selectedUsersByRegistrationId = await this.loadSelectedUsersByRegistrationIds(conn, [rows[0].id]);
      return this.fromRow(rows[0], selectedUsersByRegistrationId.get(rows[0].id) ?? []);
    } catch (error) {
      this.logger.error("TournamentRegistrationReadRepository", "findByTournamentAndTeam failed", error instanceof Error ? error : String(error));
      return new TournamentRegistration();
    } finally {
      conn.release();
    }
  }

  async findByTournament(tournamentId: number): Promise<TournamentRegistration[]> {
    const connResult = await this.db.getReadConnection();
    if (!connResult) return [];
    const { conn } = connResult;

    try {
      const [rows] = await conn.execute<TournamentRegistrationRow[]>(
        `SELECT
           tr.id,
           tr.tournament_id,
           tr.team_id,
           tr.status,
           COALESCE(tr.seed, 0) AS seed,
           tr.registered_at
         FROM tournament_registrations tr
         WHERE tr.tournament_id = ?
         ORDER BY tr.registered_at ASC`,
        [tournamentId]
      );

      const selectedUsersByRegistrationId = await this.loadSelectedUsersByRegistrationIds(
        conn,
        rows.map((row) => row.id),
      );

      return rows.map((row) => this.fromRow(row, selectedUsersByRegistrationId.get(row.id) ?? []));
    } catch (error) {
      this.logger.error("TournamentRegistrationReadRepository", "findByTournament failed", error instanceof Error ? error : String(error));
      return [];
    } finally {
      conn.release();
    }
  }

  async countByTournament(tournamentId: number): Promise<number> {
    const connResult = await this.db.getReadConnection();
    if (!connResult) return 0;
    const { conn } = connResult;

    try {
      const [rows] = await conn.execute<RowDataPacket[]>(
        `SELECT COUNT(*) AS count FROM tournament_registrations WHERE tournament_id = ?`,
        [tournamentId]
      );

      return Number(rows[0]?.count ?? 0);
    } catch (error) {
      this.logger.error("TournamentRegistrationReadRepository", "countByTournament failed", error instanceof Error ? error : String(error));
      return 0;
    } finally {
      conn.release();
    }
  }

  async countConfirmedByTournament(tournamentId: number): Promise<number> {
    const connResult = await this.db.getReadConnection();
    if (!connResult) return 0;
    const { conn } = connResult;

    try {
      const [rows] = await conn.execute<RowDataPacket[]>(
        `SELECT COUNT(*) AS count FROM tournament_registrations WHERE tournament_id = ? AND status = ?`,
        [tournamentId, RegistrationStatus.CONFIRMED]
      );

      return Number(rows[0]?.count ?? 0);
    } catch (error) {
      this.logger.error("TournamentRegistrationReadRepository", "countConfirmedByTournament failed", error instanceof Error ? error : String(error));
      return 0;
    } finally {
      conn.release();
    }
  }
}
