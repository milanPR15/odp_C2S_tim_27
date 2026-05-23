import { RowDataPacket, ResultSetHeader } from "mysql2";
import { ITeamRepository } from "../../../Domain/repositories/teams/ITeamRepository";
import { Team } from "../../../Domain/models/Team";
import { TeamMember } from "../../../Domain/models/TeamMember";
import { CreateTeamDto } from "../../../Domain/DTOs/teams/CreateTeamDto";
import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";

export class TeamRepository implements ITeamRepository {

  public constructor(
    private readonly db: DbManager,
    private readonly logger: ILoggerService
  ) {}

  async create(dto: CreateTeamDto, userId: number): Promise<Team> {
    const connResult = await this.db.getWriteConnection();
    if (!connResult) return new Team();

    const { conn } = connResult;
    try {
      const [result] = await conn.execute<ResultSetHeader>(
        `INSERT INTO team (team_name, tag, logo, description)
         VALUES (?, ?, ?, ?)`,
        [dto.team_name, dto.tag, dto.logo || "", dto.description]
      );

      const teamId = result.insertId;

      await conn.execute(
        `INSERT INTO team_members (team_id, user_id, role)
         VALUES (?, ?, 'captain')`,
        [teamId, userId]
      );

      const [rows] = await conn.execute<RowDataPacket[]>("SELECT * FROM team WHERE team_id = ?", [teamId]);
      return Team.fromDB(rows[0]);
    } catch (err) {
      this.logger.error("TeamRepository", "create failed", err);
      return new Team();
    } finally {
      conn.release();
    }
  }

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

  async update(teamId: number, teamData: Partial<Team>): Promise<boolean> {
    const connResult = await this.db.getWriteConnection();
    if (!connResult) return false;
    const { conn } = connResult;

    try {
      const [result] = await conn.execute<ResultSetHeader>(
        `UPDATE team 
         SET team_name = COALESCE(?, team_name),
             description = COALESCE(?, description)
         WHERE team_id = ?`,
        [teamData.team_name ?? null, teamData.description ?? null, teamId]
      );
      return result.affectedRows > 0;
    } catch (err) {
      this.logger.error("TeamRepository", "update failed", err);
      return false;
    } finally {
      conn.release();
    }
  }

  async delete(teamId: number): Promise<boolean> {
    const connResult = await this.db.getWriteConnection();
    if (!connResult) return false;
    const { conn } = connResult;

    try {
      const [result] = await conn.execute<ResultSetHeader>("DELETE FROM team WHERE team_id = ?", [teamId]);
      return result.affectedRows > 0;
    } catch (err) {
      this.logger.error("TeamRepository", "delete failed", err);
      return false;
    } finally {
      conn.release();
    }
  }

  async addMember(teamId: number, userId: number, role: 'captain' | 'member'): Promise<boolean> {
    const connResult = await this.db.getWriteConnection();
    if (!connResult) return false;
    const { conn } = connResult;

    try {
      await conn.execute<ResultSetHeader>(
        `INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, ?)`,
        [teamId, userId, role]
      );
      return true;
    } catch (err) {
      this.logger.error("TeamRepository", "addMember failed", err);
      return false;
    } finally {
      conn.release();
    }
  }

  async removeMember(teamId: number, userId: number): Promise<boolean> {
    const connResult = await this.db.getWriteConnection();
    if (!connResult) return false;
    const { conn } = connResult;

    try {
      const [result] = await conn.execute<ResultSetHeader>(
        `DELETE FROM team_members WHERE team_id = ? AND user_id = ?`,
        [teamId, userId]
      );
      return result.affectedRows > 0;
    } catch (err) {
      this.logger.error("TeamRepository", "removeMember failed", err);
      return false;
    } finally {
      conn.release();
    }
  }

  async changeCaptain(teamId: number, newCaptainId: number): Promise<boolean> {
    return false; // kasnije ćemo implementirati
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
}