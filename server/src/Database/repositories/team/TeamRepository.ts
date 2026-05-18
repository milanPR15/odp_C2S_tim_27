import { RowDataPacket, ResultSetHeader } from "mysql2";
import { ITeamRepository } from "../../../Domain/repositories/teams/ITeamRepository";
import { Team } from "../../../Domain/models/Team";
import { User } from "../../../Domain/models/User";
import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";

const safeInt = (n: number): number => Math.max(0, Math.floor(n));

export class TeamRepository implements ITeamRepository {
  public constructor(
    private readonly db: DbManager,
    private readonly logger: ILoggerService,
  ) {}

  // Pomoćna metoda za mapiranje redova iz baze u Team model
  private map(r: RowDataPacket): Team {
    return new Team(
      r.team_id,
      r.team_name,
      r.tag,
      r.logo,
      r.description,
      new Date(r.createdAt),
      new Date(r.updatedAt)
    );
  }

  async create(team: Omit<Team, 'team_id' | 'createdAt' | 'updatedAt'>): Promise<Team> {
    const res = await this.db.getWriteConnection();
    if (!res) throw new Error("Connection failed");
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `INSERT INTO teams (team_name, tag, logo, description) VALUES (?, ?, ?, ?)`,
        [team.team_name, team.tag, team.logo, team.description]
      );
      return new Team(result.insertId, team.team_name, team.tag, team.logo, team.description);
    } catch (err) {
      this.logger.error("TeamRepository", "create failed", err);
      throw err;
    } finally {
      res.conn.release();
    }
  }

  async findById(id: number): Promise<Team | null> {
    const res = await this.db.getReadConnection();
    if (!res) return null;
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT * FROM teams WHERE team_id = ?`, [id]
      );
      return rows.length > 0 ? this.map(rows[0]) : null;
    } finally {
      res.conn.release();
    }
  }

  async findByTag(tag: string): Promise<Team | null> {
    const res = await this.db.getReadConnection();
    if (!res) return null;
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT * FROM teams WHERE tag = ?`, [tag]
      );
      return rows.length > 0 ? this.map(rows[0]) : null;
    } finally {
      res.conn.release();
    }
  }

  async update(id: number, teamData: Partial<Team>): Promise<boolean> {
    const res = await this.db.getWriteConnection();
    if (!res) return false;
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `UPDATE teams SET team_name = COALESCE(?, team_name), description = COALESCE(?, description) WHERE team_id = ?`,
        [teamData.team_name ?? null, teamData.description ?? null, id]
      );
      return result.affectedRows > 0;
    } finally {
      res.conn.release();
    }
  }

  async delete(id: number): Promise<boolean> {
    const res = await this.db.getWriteConnection();
    if (!res) return false;
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `DELETE FROM teams WHERE team_id = ?`, [id]
      );
      return result.affectedRows > 0;
    } finally {
      res.conn.release();
    }
  }

  async addMember(teamId: number, userId: number, role: 'captain' | 'member'): Promise<void> {
    const res = await this.db.getWriteConnection();
    if (!res) return;
    try {
      await res.conn.execute(
        `INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, ?)`,
        [teamId, userId, role]
      );
    } finally {
      res.conn.release();
    }
  }

  async removeMember(teamId: number, userId: number): Promise<boolean> {
    const res = await this.db.getWriteConnection();
    if (!res) return false;
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `DELETE FROM team_members WHERE team_id = ? AND user_id = ?`, [teamId, userId]
      );
      return result.affectedRows > 0;
    } finally {
      res.conn.release();
    }
  }

  async updateMemberRole(teamId: number, userId: number, newRole: 'captain' | 'member'): Promise<boolean> {
    const res = await this.db.getWriteConnection();
    if (!res) return false;
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `UPDATE team_members SET role = ? WHERE team_id = ? AND user_id = ?`,
        [newRole, teamId, userId]
      );
      return result.affectedRows > 0;
    } finally {
      res.conn.release();
    }
  }

  async findTeamsByUserId(userId: number): Promise<Team[]> {
    const res = await this.db.getReadConnection();
    if (!res) return [];
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT t.* FROM teams t JOIN team_members tm ON t.team_id = tm.team_id WHERE tm.user_id = ?`,
        [userId]
      );
      return rows.map(r => this.map(r));
    } finally {
      res.conn.release();
    }
  }

  // Tvoja metoda koju si već počela pisati
  async getTeamMembers(teamId: number): Promise<(User & { role: string, joined_at: Date })[]> {
    const res = await this.db.getReadConnection();
    if (!res) return [];
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT u.*, tm.role, tm.joined_at 
         FROM users u
         JOIN team_members tm ON u.id = tm.user_id
         WHERE tm.team_id = ?`,
        [teamId]
      );
      return rows.map(r => ({
        ...new User(r.id, r.gamer_tag, r.full_name, r.email, r.role, "", r.isActive, r.profile_image, new Date(r.createdAt), new Date(r.updatedAt)),
        role: r.role,
        joined_at: new Date(r.joined_at)
      }));
    } catch (err) {
      this.logger.error("TeamRepository", "getTeamMembers failed", err);
      return [];
    } finally {
      res.conn.release();
    }
  }

  async getConfirmedTournamentTeams(tournamentId: number): Promise<Team[]> {

    const res = await this.db.getReadConnection();

    if (!res) {
      return [];
    }

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

      return rows.map(r => this.map(r));

    } finally {

      res.conn.release();
    }
  }
}