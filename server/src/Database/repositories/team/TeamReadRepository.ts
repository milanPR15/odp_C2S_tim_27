import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";
import { Team } from "../../../Domain/models/Team";
import { TeamMember } from "../../../Domain/models/TeamMember";
import { RowDataPacket } from "mysql2";
import { TeamMapper } from "./TeamMapper";
import { ITeamReadRepository } from "../../../Domain/repositories/teams/ITeamReadRepository";

export class TeamReadRepository implements ITeamReadRepository {
  constructor(
    private readonly db: DbManager,
    private readonly logger: ILoggerService
  ) {}

  async findById(teamId: number): Promise<Team> {
    const connResult = await this.db.getReadConnection();
    if (!connResult) return new Team();
    const { conn } = connResult;

    try {
      const [rows] = await conn.execute<RowDataPacket[]>("SELECT * FROM team WHERE team_id = ?", [teamId]);
      const row = rows[0];
      return row ? Team.fromDB(row) : new Team();
    } catch (err) {
      this.logger.error("TeamRepository", "findById failed", err instanceof Error ? err : String(err));
      return new Team();
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
        SELECT *
        FROM team
        WHERE team_id IN (
          SELECT team_id
          FROM team_members
          WHERE user_id = ?
        )
      `, [userId]);

      return rows.map((row) => Team.fromDB(row));
    } catch (err) {
      this.logger.error("TeamRepository", "findByUserId failed", err instanceof Error ? err : String(err));
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
      this.logger.error("TeamRepository", "findMembers failed", err instanceof Error ? err : String(err));
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
      this.logger.error("TeamRepository", "isUserInTeam failed", err instanceof Error ? err : String(err));
      return false;
    } finally {
      conn.release();
    }
  }

  async findByIds(teamIds: number[]): Promise<Team[]> {
    if (!teamIds || teamIds.length === 0) return [];
    const res = await this.db.getReadConnection();
    if (!res) return [];
    try {
      const placeholders = teamIds.map(() => '?').join(',');
      const [rows] = await res.conn.execute<RowDataPacket[]>(`SELECT * FROM team WHERE team_id IN (${placeholders})`, teamIds);
      return rows.map(r => TeamMapper.fromRow(r));
    } finally {
      res.conn.release();
    }
  }

  async isUserCaptain(teamId: number, userId: number): Promise<boolean> {
    const connResult = await this.db.getReadConnection();
    if (!connResult) return false;
    const { conn } = connResult;

    try {
      const [rows] = await conn.execute<RowDataPacket[]>(
        `SELECT 1 FROM team_members WHERE team_id = ? AND user_id = ? AND role = 'captain' LIMIT 1`,
        [teamId, userId]
      );
      return rows.length > 0;
    } catch (err) {
      this.logger.error("TeamRepository", "isUserCaptain failed", err instanceof Error ? err : String(err));
      return false;
    } finally {
      conn.release();
    }
  }

}