import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";
import { ITournamentRegistrationRepository } from "../../../Domain/repositories/tournaments/ITournamentRegistrationRepository";
import { TournamentRegistration } from "../../../Domain/models/TournamentRegistration";
import { TournamentRegistrationDto } from "../../../Domain/DTOs/tournaments/TournamentRegistrationDto";
import { RegistrationStatus } from "../../../Domain/enums/RegistrationStatus";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

type TournamentRegistrationRow = RowDataPacket & {
  id: number;
  tournament_id: number;
  team_id: number;
  team_name?: string;
  selected_player_ids: string | null;
  status: string;
  seed: number | null;
  registered_at: Date | string;
};

export class TournamentRegistrationRepository implements ITournamentRegistrationRepository {
  constructor(
    private readonly db: DbManager,
    private readonly logger: ILoggerService
  ) {}

  private fromRow(row: TournamentRegistrationRow): TournamentRegistration {
    const selectedPlayerIds = row.selected_player_ids ? JSON.parse(row.selected_player_ids) as number[] : [];

    return new TournamentRegistration(
      row.id,
      row.tournament_id,
      row.team_id,
      row.status as RegistrationStatus,
      row.seed,
      row.registered_at instanceof Date ? row.registered_at : new Date(row.registered_at),
      selectedPlayerIds
    );
  }

  private fromDtoRow(row: TournamentRegistrationRow): TournamentRegistrationDto {
    const selectedPlayerIds = row.selected_player_ids ? JSON.parse(row.selected_player_ids) as number[] : [];

    return new TournamentRegistrationDto(
      row.id,
      row.tournament_id,
      row.team_id,
      row.team_name ?? "",
      row.status as RegistrationStatus,
      row.seed,
      row.registered_at instanceof Date ? row.registered_at : new Date(row.registered_at),
      selectedPlayerIds
    );
  }

  async findById(id: number): Promise<TournamentRegistration | null> {
    const connResult = await this.db.getReadConnection();
    if (!connResult) return null;
    const { conn } = connResult;

    try {
      const [rows] = await conn.execute<TournamentRegistrationRow[]>(
        `SELECT * FROM tournament_registrations WHERE id = ? LIMIT 1`,
        [id]
      );

      return rows[0] ? this.fromRow(rows[0]) : null;
    } catch (err) {
      this.logger.error("TournamentRegistrationRepository", "findById failed", err);
      return null;
    } finally {
      conn.release();
    }
  }

  async findByTournamentAndTeam(tournamentId: number, teamId: number): Promise<TournamentRegistration | null> {
    const connResult = await this.db.getReadConnection();
    if (!connResult) return null;
    const { conn } = connResult;

    try {
      const [rows] = await conn.execute<TournamentRegistrationRow[]>(
        `SELECT * FROM tournament_registrations WHERE tournament_id = ? AND team_id = ? LIMIT 1`,
        [tournamentId, teamId]
      );

      return rows[0] ? this.fromRow(rows[0]) : null;
    } catch (err) {
      this.logger.error("TournamentRegistrationRepository", "findByTournamentAndTeam failed", err);
      return null;
    } finally {
      conn.release();
    }
  }

  async findByTournament(tournamentId: number): Promise<TournamentRegistrationDto[]> {
    const connResult = await this.db.getReadConnection();
    if (!connResult) return [];
    const { conn } = connResult;

    try {
      const [rows] = await conn.execute<TournamentRegistrationRow[]>(
        `SELECT tr.*, t.team_name
         FROM tournament_registrations tr
         JOIN team t ON t.team_id = tr.team_id
         WHERE tr.tournament_id = ?
         ORDER BY tr.registered_at ASC`,
        [tournamentId]
      );

      return rows.map((row) => this.fromDtoRow(row));
    } catch (err) {
      this.logger.error("TournamentRegistrationRepository", "findByTournament failed", err);
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
    } catch (err) {
      this.logger.error("TournamentRegistrationRepository", "countByTournament failed", err);
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
    } catch (err) {
      this.logger.error("TournamentRegistrationRepository", "countConfirmedByTournament failed", err);
      return 0;
    } finally {
      conn.release();
    }
  }

  async create(registration: TournamentRegistration): Promise<TournamentRegistration | null> {
    const connResult = await this.db.getWriteConnection();
    if (!connResult) return null;
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
          registration.seed,
        ]
      );

      if (result.insertId === 0) return null;

      const [rows] = await conn.execute<TournamentRegistrationRow[]>(
        `SELECT * FROM tournament_registrations WHERE id = ? LIMIT 1`,
        [result.insertId]
      );

      return rows[0] ? this.fromRow(rows[0]) : null;
    } catch (err) {
      this.logger.error("TournamentRegistrationRepository", "create failed", err);
      return null;
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
    } catch (err) {
      this.logger.error("TournamentRegistrationRepository", "updateStatus failed", err);
      return false;
    } finally {
      conn.release();
    }
  }
}