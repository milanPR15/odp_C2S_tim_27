import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";
import { Team } from "../../../Domain/models/Team";
import { TeamMember } from "../../../Domain/models/TeamMember";
import { RowDataPacket } from "mysql2";
import { TeamMapper } from "./TeamMapper";

export class TeamReadRepository {
  constructor(
    private readonly db: DbManager,
    private readonly logger: ILoggerService
  ) {}

  async findById(teamId: number): Promise<Team | null> {
    const connResult = await this.db.getReadConnection();
    if (!connResult) return null;
    const { conn } = connResult;

    try {
      const [rows] = await conn.execute<RowDataPacket[]>("SELECT * FROM team WHERE team_id = ?", [teamId]);
      const row = rows[0];
      return row ? Team.fromDB(row) : null;
    } catch (err) {
      this.logger.error("TeamRepository", "findById failed", err);
      return null;
    } finally {
      conn.release();
    }
  }

  async findByUserId(userId: number): Promise<Team[]> {
    const connResult = await this.db.getReadConnection();
    if (!connResult) return [];
    const { conn } = connResult;

    try {
      const [rows] = await conn.execute<RowDataPacket[]>(`
        SELECT t.* FROM team t
        JOIN team_members tm ON t.team_id = tm.team_id
        WHERE tm.user_id = ?
      `, [userId]);

      return rows.map((row) => Team.fromDB(row));
    } catch (err) {
      this.logger.error("TeamRepository", "findByUserId failed", err);
      return [];
    } finally {
      conn.release();
    }
  }


  async findMembers(teamId: number): Promise<TeamMember[]> {
    const connResult = await this.db.getReadConnection();
    if (!connResult) return [];
    const { conn } = connResult;

    try {
      const [rows] = await conn.execute<RowDataPacket[]>(`
        SELECT tm.* FROM team_members tm WHERE tm.team_id = ?
      `, [teamId]);

      return rows.map((row) => TeamMember.fromDB(row));
    } catch (err) {
      this.logger.error("TeamRepository", "findMembers failed", err);
      return [];
    } finally {
      conn.release();
    }
  }

  async isUserInTeam(userId: number, teamId: number): Promise<boolean> {
    const connResult = await this.db.getReadConnection();
    if (!connResult) return false;
    const { conn } = connResult;

    try {
      const [rows] = await conn.execute<RowDataPacket[]>(
        `SELECT 1 FROM team_members WHERE team_id = ? AND user_id = ? LIMIT 1`,
        [teamId, userId]
      );
      return rows.length > 0;
    } catch (err) {
      this.logger.error("TeamRepository", "isUserInTeam failed", err);
      return false;
    } finally {
      conn.release();
    }
  }

  async getConfirmedTournamentTeams(tournamentId: number): Promise<Team[]> {
    const res = await this.db.getReadConnection();
    if (!res) return [];

    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `
        SELECT t.*
        FROM teams t
        JOIN tournament_registrations tr
          ON t.team_id = tr.team_id
        WHERE tr.tournament_id = ?
          AND tr.status = 'confirmed'
        `,
        [tournamentId]
      );
      return rows.map(r => TeamMapper.fromRow(r));
    } finally {
      res.conn.release();
    }
  }

}