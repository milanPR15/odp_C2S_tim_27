import bcrypt from "bcryptjs";
import { IAuthService } from "../../Domain/services/auth/IAuthService";
import { IUserWriteRepository } from "../../Domain/repositories/users/IUserWriteRepository";
import { IUserReadRepository } from "../../Domain/repositories/users/IUserReadRepository";
import { AuthUserDto } from "../../Domain/DTOs/auth/AuthUserDto";
import { UserRole } from "../../Domain/enums/UserRole";
import { User } from "../../Domain/models/User";

export class AuthService implements IAuthService {
  private readonly saltRounds = parseInt(process.env.SALT_ROUNDS ?? "10", 10);

  public constructor(
    private readonly userWriteRepo: IUserWriteRepository,
    private readonly userReadRepo : IUserReadRepository
  ) {}

  async login(username: string, password: string): Promise<AuthUserDto> {
    const user = await this.userReadRepo.findByUsername(username);
    if (user.id === 0 || user.isActive === 0) return new AuthUserDto();
    const match = await bcrypt.compare(password, user.passwordHash).catch(() => false);
    if (!match) return new AuthUserDto();
    return new AuthUserDto(user.id, user.gamer_tag, user.role);
  }

  async register(username: string, fullname: string, email: string, role: string, password: string): Promise<AuthUserDto> {
    const byName = await this.userReadRepo.findByUsername(username);
    if (byName.id !== 0) return new AuthUserDto();
    const byEmail = await this.userReadRepo.findByEmail(email);
    if (byEmail.id !== 0) return new AuthUserDto();
    const hash = await bcrypt.hash(password, this.saltRounds).catch(() => "");
    if (!hash) return new AuthUserDto();
    const userRole = role === UserRole.ADMIN ? UserRole.ADMIN : UserRole.PLAYER;
    const created = await this.userWriteRepo.create(new User(0, username, fullname, email, userRole, hash));
    if (created.id === 0) return new AuthUserDto();
    return new AuthUserDto(created.id, created.gamer_tag, created.role);
  }
}
