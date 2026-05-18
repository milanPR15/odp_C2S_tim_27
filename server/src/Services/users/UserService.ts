import { IUserService } from "../../Domain/services/users/IUserService";
import { IUserRepository } from "../../Domain/repositories/users/IUserRepository";
import { UserDto } from "../../Domain/DTOs/users/UserDto";
import { UpdateProfileDto } from "../../Domain/DTOs/account/UpdateProfileDto";
import { Result } from "../../Domain/types/Result";
import { ILoggerService } from "../../Domain/services/logger/ILoggerService";
import { IAuditLogService } from "../../Domain/services/auditLogs/IAuditLogService";
import { validateUpdateProfile } from "../../WebAPI/validators/account/validateUpdateProfile";
import bcrypt from "bcryptjs";

export class UserService implements IUserService {
  public constructor(
    private readonly userRepo: IUserRepository,
    private readonly logger: ILoggerService,
    private readonly auditLogService: IAuditLogService
  ) {}

  async getAll(): Promise<UserDto[]> {
    const users = await this.userRepo.findAll();
    return users.map((u) => new UserDto(u.id, u.gamer_tag, u.email, u.role, u.isActive));
  }

  async getById(id: number): Promise<UserDto | null> {
    const u = await this.userRepo.findById(id);
    if (u.id === 0) return null;
    return new UserDto(u.id, u.gamer_tag, u.email, u.role, u.isActive);
  }

  async getCurrentProfile(userId: number): Promise<UserDto | null> {

    const user = await this.userRepo.findById(userId);

    if (user.id === 0) {
      return null;
    }

    return new UserDto(user.id, user.gamer_tag, user.email, user.role, user.isActive);
  }

  async deactivate(id: number): Promise<boolean> {
    return this.userRepo.deactivate(id);
  }

  async updateProfile(userId: number, dto: UpdateProfileDto): Promise<Result<{ message: string }>> {
    const validation = validateUpdateProfile(dto);
    if (!validation.valid) {
      this.logger.warn("UserService", `updateProfile validation failed: ${validation.message}`);
      return { success: false, error: validation.message!, statusCode: 400 };
    }

    if (dto.email) {

    const existingUser = await this.userRepo.findByEmail(dto.email);

    if (existingUser.id !== 0 && existingUser.id !== userId) {
      return {
        success: false,
        error: "Email already in use",
        statusCode: 400
      };
    }
  }

  if (dto.gamer_tag) {

    const existingUser = await this.userRepo.findByUsername(dto.gamer_tag);

    if (existingUser.id !== 0 && existingUser.id !== userId) {
      return {
        success: false,
        error: "Gamer tag already in use",
        statusCode: 400
      };
    }
  }

    let hashedPassword: string | undefined;
    if (dto.password) {
      hashedPassword = await bcrypt.hash(dto.password, 10);
    }

    const dtoForRepo = new UpdateProfileDto(
      dto.gamer_tag,
      dto.full_name,
      dto.email,
      hashedPassword,
      dto.profile_image
    );

    const updateSuccess = await this.userRepo.updateProfile(userId, dtoForRepo);

    if (!updateSuccess) {
      this.logger.error("UserService", `Failed to update profile for user ${userId}`);
      return { success: false, error: "Failed to update profile", statusCode: 500 };
    }

    await this.auditLogService.log(
      userId,
      "PROFILE_UPDATED",
      "User",
      userId,
      `User updated profile${dto.gamer_tag ? ` (new gamer_tag: ${dto.gamer_tag})` : ""}`
    );

    this.logger.info("UserService", `Profile for user ${userId} successfully updated`);

    return {
      success: true,
      data: { message: "Profile updated successfully" },
    };
  }
}