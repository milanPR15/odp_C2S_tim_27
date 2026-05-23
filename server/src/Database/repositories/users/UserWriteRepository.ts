import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";
import { User } from "../../../Domain/models/User";
import { ResultSetHeader } from "mysql2/promise";
import { UpdateProfileDto } from "../../../Domain/DTOs/account/UpdateProfileDto";

export class UserWriteRepository {
  constructor(
    private readonly db: DbManager,
    private readonly logger: ILoggerService
  ) {}

  async create(user: User): Promise<User> {
    const res = await this.db.getWriteConnection();
    if (!res) return new User();
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `INSERT INTO users (gamer_tag, full_name, email, role, password_hash) VALUES (?, ?, ?, ?, ?)`,
        [user.gamer_tag, user.full_name, user.email, user.role, user.passwordHash]
      );
      if (result.insertId === 0) return new User();
      return new User(result.insertId, user.gamer_tag, user.full_name, user.email, user.role, user.passwordHash);
    } catch (err) {
      this.logger.error("UserRepository", "create failed", err);
      return new User();
    } finally { res.conn.release(); }
  }

  async update(user: User): Promise<boolean> {
    const res = await this.db.getWriteConnection();
    if (!res) return false;
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `UPDATE users SET gamer_tag = ?, email = ?, role = ?, is_active = ? WHERE id = ?`,
        [user.gamer_tag, user.email, user.role, user.isActive, user.id]
      );
      return result.affectedRows > 0;
    } catch (err) {
      this.logger.error("UserRepository", "update failed", err);
      return false;
    } finally { res.conn.release(); }
  }

  async deactivate(id: number): Promise<boolean> {
    const res = await this.db.getWriteConnection();
    if (!res) return false;
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `UPDATE users SET is_active = 0 WHERE id = ?`, [id]
      );
      return result.affectedRows > 0;
    } catch (err) {
      this.logger.error("UserRepository", "deactivate failed", err);
      return false;
    } finally { res.conn.release(); }
  }

  async updateProfile(userId: number, dto: UpdateProfileDto): Promise<boolean> {
    const connResult = await this.db.getWriteConnection();
    if (!connResult) {
      this.logger.error("UserRepository", "updateProfile - nema konekcije");
      return false;
    }
    const { conn } = connResult;

    try {
      const [result] = await conn.execute<ResultSetHeader>(
        `UPDATE users 
         SET 
           gamer_tag     = COALESCE(?, gamer_tag),
           full_name     = COALESCE(?, full_name),
           email         = COALESCE(?, email),
           password_hash = COALESCE(?, password_hash),
           profile_image = COALESCE(?, profile_image),
           updatedAt     = NOW()
         WHERE id = ?`,
        [
          dto.gamer_tag ?? null,
          dto.full_name ?? null,
          dto.email ?? null,
          dto.password ?? null,
          dto.profile_image ?? null,
          userId
        ]
      );

      const success = result.affectedRows > 0;
      if (success) {
        this.logger.info("UserRepository", `Profil korisnika ${userId} uspešno ažuriran`);
      }
      return success;
    } catch (err) {
      this.logger.error("UserRepository", "updateProfile failed", err);
      return false;
    } finally {
      conn.release();
    }
  }

}