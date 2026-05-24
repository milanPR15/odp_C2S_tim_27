import { User } from "../../models/User";

export interface IUserReadRepository {
  findById(id: number): Promise<User>;
  findByUsername(username: string): Promise<User>;
  findByEmail(email: string): Promise<User>;
  findAll(): Promise<User[]>;
  exists(id: number): Promise<boolean>;
}
