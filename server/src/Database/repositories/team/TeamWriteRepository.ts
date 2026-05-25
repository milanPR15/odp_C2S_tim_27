import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";
import { Team } from "../../../Domain/models/Team";
import { CreateTeamDto } from "../../../Domain/DTOs/teams/CreateTeamDto";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { TeamMapper } from "./TeamMapper";
import { ITeamWriteRepository } from "../../../Domain/repositories/teams/ITeamWriteRepository";


export class TeamWriteRepository implements ITeamWriteRepository{
  constructor(
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
      this.logger.error("TeamRepository", "create failed", err instanceof Error ? err : String(err));
      return new Team();
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
      this.logger.error("TeamRepository", "update failed", err instanceof Error ? err : String(err));
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
      this.logger.error("TeamRepository", "delete failed", err instanceof Error ? err : String(err));
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
      this.logger.error("TeamRepository", "addMember failed", err instanceof Error ? err : String(err));
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
      this.logger.error("TeamRepository", "removeMember failed", err instanceof Error ? err : String(err));
      return false;
    } finally {
      conn.release();
    }
  }


  async changeCaptain(teamId: number, newCaptainId: number): Promise<boolean> {
    return false;
  }

  
}