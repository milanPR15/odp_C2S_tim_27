import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";
import { User } from "../../../Domain/models/User";
import { RowDataPacket } from "mysql2/promise";
import { UserMapper } from "./UserMapper";
import { IUserReadRepository } from "../../../Domain/repositories/users/IUserReadRepository";

export class UserReadRepository  implements IUserReadRepository{
  constructor(
    private readonly db: DbManager,
    private readonly logger: ILoggerService
  ) {}

  async findById(id: number): Promise<User> {
    const res = await this.db.getReadConnection();
    if (!res) return new User();
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(`SELECT * FROM users WHERE id = ?`, [id]);
      return rows.length > 0 ? UserMapper.fromRow(rows[0]) : new User();
    } catch (err) {
      this.logger.error("UserRepository", "findById failed", err);
      return new User();
    } finally { res.conn.release(); }
  }


  async findByUsername(username: string): Promise<User> {
    const res = await this.db.getReadConnection();
    if (!res) return new User();
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(`SELECT * FROM users WHERE gamer_tag = ?`, [username]);
      return rows.length > 0 ? UserMapper.fromRow(rows[0]) : new User();
    } catch (err) {
      this.logger.error("UserRepository", "findByUsername failed", err);
      return new User();
    } finally { res.conn.release(); }
  }

 async findByEmail(email: string): Promise<User> {
    const res = await this.db.getReadConnection();
    if (!res) return new User();
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(`SELECT * FROM users WHERE email = ?`, [email]);
      return rows.length > 0 ? UserMapper.fromRow(rows[0]) : new User();
    } catch (err) {
      this.logger.error("UserRepository", "findByEmail failed", err);
      return new User();
    } finally { res.conn.release(); }
  }


  async findAll(): Promise<User[]> {
    const res = await this.db.getReadConnection();
    if (!res) return [];
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(`SELECT * FROM users ORDER BY id ASC`);
      return rows.map(r => UserMapper.fromRow(r));
    } catch (err) {
      this.logger.error("UserRepository", "findAll failed", err);
      return [];
    } finally { res.conn.release(); }
  }


  async exists(id: number): Promise<boolean> {
    const res = await this.db.getReadConnection();
    if (!res) return false;
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT COUNT(*) as cnt FROM users WHERE id = ?`, [id]
      );
      return (rows[0]?.cnt ?? 0) > 0;
    } catch (err) {
      this.logger.error("UserRepository", "exists failed", err);
      return false;
    } finally { res.conn.release(); }
  }

}