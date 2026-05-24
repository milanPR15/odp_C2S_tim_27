import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";
import { TeamInvitation } from "../../../Domain/models/TeamInvitation";
import { InvitationStatus } from "../../../Domain/enums/InvitationStatus";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { TeamInvitationMapper } from "./TeamInvitationMapper";
import { ITeamInvitationWriteRepository } from "../../../Domain/repositories/team_invitations/ITeamInvitationWriteRepository";

export class TeamInvitationWriteRepository implements ITeamInvitationWriteRepository{
  constructor(
    private readonly db: DbManager,
    private readonly logger: ILoggerService
  ) {}

  async create(teamId: number, userId: number): Promise<TeamInvitation> {
    const res = await this.db.getWriteConnection();
    if (!res) return new TeamInvitation();

    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `INSERT INTO team_invitations (team_id, user_id, status)
         VALUES (?, ?, ?)`,
        [teamId, userId, InvitationStatus.PENDING]
      );

      const [rows] = await res.conn.execute<RowDataPacket[]>(
        "SELECT * FROM team_invitations WHERE id = ?",
        [result.insertId]
      );
      
      const row = rows[0];
      return rows.length > 0 ? TeamInvitationMapper.fromRow(rows[0]) : new TeamInvitation();
    } catch (err) {
      this.logger.error("TeamInvitationRepository", "create failed", err);
      return new TeamInvitation();
    } finally {
      res.conn.release();
    }
  }


  async updateStatus(id: number, status: InvitationStatus): Promise<boolean> {
    const res = await this.db.getWriteConnection();
    if (!res) return false;

    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        "UPDATE team_invitations SET status = ? WHERE id = ?",
        [status, id]
      );

      return result.affectedRows > 0;
    } catch (err) {
      this.logger.error("TeamInvitationRepository", "updateStatus failed", err);
      return false;
    } finally {
      res.conn.release();
    }
  }


  async deleteById(id: number): Promise<boolean> {
    const res = await this.db.getWriteConnection();
    if (!res) return false;

    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        "DELETE FROM team_invitations WHERE id = ?",
        [id]
      );
      return result.affectedRows > 0;
    } catch (err) {
      this.logger.error("TeamInvitationRepository", "deleteById failed", err);
      return false;
    } finally {
      res.conn.release();
    }
  }

}