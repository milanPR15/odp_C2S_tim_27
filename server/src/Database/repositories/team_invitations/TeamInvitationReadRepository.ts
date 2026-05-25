import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";
import { TeamInvitation } from "../../../Domain/models/TeamInvitation";
import { InvitationStatus } from "../../../Domain/enums/InvitationStatus";
import { RowDataPacket } from "mysql2";
import { TeamInvitationMapper } from "./TeamInvitationMapper";
import { ITeamInvitationReadRepository } from "../../../Domain/repositories/team_invitations/ITeamInvitationReadRepository";

export class TeamInvitationReadRepository implements ITeamInvitationReadRepository{
  constructor(
    private readonly db: DbManager,
    private readonly logger: ILoggerService
  ) {}

  async findById(id: number): Promise<TeamInvitation | null> {
    const res = await this.db.getReadConnection();
    if (!res) return null;

    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        "SELECT * FROM team_invitations WHERE id = ?",
        [id]
      );
      return rows.length > 0 ? TeamInvitationMapper.fromRow(rows[0]) : null;
    } catch (err) {
      this.logger.error("TeamInvitationRepository", "findById failed", err instanceof Error ? err : String(err));
      return null;
    } finally {
      res.conn.release();
    }
  }


  async findByTeamAndUser(teamId: number, userId: number): Promise<TeamInvitation | null> {
    const res = await this.db.getReadConnection();
    if (!res) return null;

    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        "SELECT * FROM team_invitations WHERE team_id = ? AND user_id = ? AND status = ?",
        [teamId, userId, InvitationStatus.PENDING]
      );

      return rows.length > 0 ? TeamInvitationMapper.fromRow(rows[0]) : null;
    } catch (err) {
      this.logger.error("TeamInvitationRepository", "findByTeamAndUser failed", err instanceof Error ? err : String(err));
      return null;
    } finally {
      res.conn.release();
    }
  }


  async findByUserId(userId: number): Promise<TeamInvitation[]> {
    const res = await this.db.getReadConnection();
    if (!res) return [];

    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        "SELECT * FROM team_invitations WHERE user_id = ?",
        [userId]
      );
     return rows.map(row => TeamInvitationMapper.fromRow(row));
    } catch (err) {
      this.logger.error("TeamInvitationRepository", "findByUserId failed", err instanceof Error ? err : String(err));
      return [];
    } finally {
      res.conn.release();
    }
  }


  async findByTeamId(teamId: number): Promise<TeamInvitation[]> {
    const res = await this.db.getReadConnection();
    if (!res) return [];

    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        "SELECT * FROM team_invitations WHERE team_id = ?",
        [teamId]
      );
        return rows.map(row => TeamInvitationMapper.fromRow(row));    
      } catch (err) {
      this.logger.error("TeamInvitationRepository", "findByTeamId failed", err instanceof Error ? err : String(err));
      return [];
    } finally {
      res.conn.release();
    }
  }
}
