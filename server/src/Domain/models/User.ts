import { UserRole } from "../enums/UserRole";

export class User {
  constructor(
    public id: number        = 0,
    public gamer_tag: string = "",
    public full_name: string  = "",
    public email: string     = "",
    public role: UserRole    = UserRole.PLAYER,
    public passwordHash: string = "",
    public isActive: number  = 1,
    public profile_image: string = "",
    public createdAt: Date = new Date(), 
    public updatedAt: Date = new Date(), 
    
  ) {}
}
