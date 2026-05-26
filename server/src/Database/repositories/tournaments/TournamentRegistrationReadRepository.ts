import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";
import { ITournamentRegistrationReadRepository } from "../../../Domain/repositories/tournaments/ITournamentRegistrationReadRepository";
import { TournamentRegistration } from "../../../Domain/models/TournamentRegistration";
import { TournamentRegistrationDto } from "../../../Domain/DTOs/tournaments/TournamentRegistrationDto";
import { RegistrationStatus } from "../../../Domain/enums/RegistrationStatus";
import { RowDataPacket } from "mysql2/promise";

type TournamentRegistrationRow = RowDataPacket & {
  id: number;
  tournament_id: number;
  team_id: number;
  team_name: string;
  selected_player_ids: string;
  status: string;
  seed: number;
  registered_at: Date | string;
};

export class TournamentRegistrationReadRepository implements ITournamentRegistrationReadRepository {
  constructor(
    private readonly db: DbManager,
    private readonly logger: ILoggerService
  ) {}

  private fromRow(row: TournamentRegistrationRow): TournamentRegistration {
    const selectedPlayerIds = row.selected_player_ids === "" ? [] : JSON.parse(row.selected_player_ids) as number[];

    return new TournamentRegistration(
      row.id,
      row.tournament_id,
      row.team_id,
      row.status as RegistrationStatus,
      row.seed ?? 0,
      row.registered_at instanceof Date ? row.registered_at : new Date(row.registered_at),
      selectedPlayerIds
    );
  }

  private fromDtoRow(row: TournamentRegistrationRow): TournamentRegistrationDto {
    const selectedPlayerIds = row.selected_player_ids === "" ? [] : JSON.parse(row.selected_player_ids) as number[];

    return new TournamentRegistrationDto(
      row.id,
      row.tournament_id,
      row.team_id,
      row.team_name ?? "",
      row.status as RegistrationStatus,
      row.seed ?? 0,
      row.registered_at instanceof Date ? row.registered_at : new Date(row.registered_at),
      selectedPlayerIds
    );
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
           COALESCE(selected_player_ids, '') AS selected_player_ids,
           status,
           COALESCE(seed, 0) AS seed,
           registered_at
         FROM tournament_registrations
         WHERE id = ?
         LIMIT 1`,
        [id]
      );

      return rows[0] ? this.fromRow(rows[0]) : new TournamentRegistration();
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
           COALESCE(selected_player_ids, '') AS selected_player_ids,
           status,
           COALESCE(seed, 0) AS seed,
           registered_at
         FROM tournament_registrations
         WHERE tournament_id = ? AND team_id = ?
         LIMIT 1`,
        [tournamentId, teamId]
      );

      return rows[0] ? this.fromRow(rows[0]) : new TournamentRegistration();
    } catch (error) {
      this.logger.error("TournamentRegistrationReadRepository", "findByTournamentAndTeam failed", error instanceof Error ? error : String(error));
      return new TournamentRegistration();
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
        `SELECT
           tr.id,
           tr.tournament_id,
           tr.team_id,
           COALESCE((
             SELECT t.team_name
             FROM team t
             WHERE t.team_id = tr.team_id
             LIMIT 1
           ), '') AS team_name,
           COALESCE(tr.selected_player_ids, '') AS selected_player_ids,
           tr.status,
           COALESCE(tr.seed, 0) AS seed,
           tr.registered_at
         FROM tournament_registrations tr
         WHERE tr.tournament_id = ?
         ORDER BY tr.registered_at ASC`,
        [tournamentId]
      );

      return rows.map((row) => this.fromDtoRow(row));
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
