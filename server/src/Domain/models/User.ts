import { UserRole } from "../enums/UserRole";

export class User {
  constructor(
    public id: number        = 0,
    public username: string  = "",
    public fullname: string  = "",
    public email: string     = "",
    public role: UserRole    = UserRole.PLAYER,
    public passwordHash: string = "",
    public isActive: number  = 1,
  ) {}
}
