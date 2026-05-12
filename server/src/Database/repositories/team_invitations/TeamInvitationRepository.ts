import { RowDataPacket, ResultSetHeader } from "mysql2";
import { ITeamInvitationRepository } from "../../../Domain/repositories/team_invitations/ITeamInvitationRepository";
import { TeamInvitation } from "../../../Domain/models/TeamInvitation";
import { InvitationStatus } from "../../../Domain/enums/InvitationStatus";
import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";

export class TeamInvitationRepository implements ITeamInvitationRepository {
  public constructor(
    private readonly db: DbManager,
    private readonly logger: ILoggerService
  ) {}

  private mapToDomain(row: RowDataPacket): TeamInvitation {
    return new TeamInvitation(
      row.id,
      row.team_id,
      row.user_id,
      row.status as InvitationStatus,
      row.created_at ? new Date(row.created_at) : new Date(),
      row.updated_at ? new Date(row.updated_at) : new Date()
    );
  }

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
      return row ? this.mapToDomain(row) : new TeamInvitation();
    } catch (err) {
      this.logger.error("TeamInvitationRepository", "create failed", err);
      return new TeamInvitation();
    } finally {
      res.conn.release();
    }
  }

  async findById(id: number): Promise<TeamInvitation | null> {
    const res = await this.db.getReadConnection();
    if (!res) return null;

    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        "SELECT * FROM team_invitations WHERE id = ?",
        [id]
      );

      return rows[0] ? this.mapToDomain(rows[0]) : null;
    } catch (err) {
      this.logger.error("TeamInvitationRepository", "findById failed", err);
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

      return rows[0] ? this.mapToDomain(rows[0]) : null;
    } catch (err) {
      this.logger.error("TeamInvitationRepository", "findByTeamAndUser failed", err);
      return null;
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

  async findByUserId(userId: number): Promise<TeamInvitation[]> {
    const res = await this.db.getReadConnection();
    if (!res) return [];

    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        "SELECT * FROM team_invitations WHERE user_id = ?",
        [userId]
      );
      return rows.map(row => this.mapToDomain(row));
    } catch (err) {
      this.logger.error("TeamInvitationRepository", "findByUserId failed", err);
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
      return rows.map(row => this.mapToDomain(row));
    } catch (err) {
      this.logger.error("TeamInvitationRepository", "findByTeamId failed", err);
      return [];
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
