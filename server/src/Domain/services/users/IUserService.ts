import { UpdateProfileDto } from "../../DTOs/account/UpdateProfileDto";
import { UserDto } from "../../DTOs/users/UserDto";
import { Result } from "../../types/Result";

export interface IUserService {
  getAll(): Promise<UserDto[]>;
  getById(id: number): Promise<UserDto | null>;
  deactivate(id: number): Promise<boolean>;
  updateProfile(userId: number, dto: UpdateProfileDto): Promise<Result<{ message: string }>>;
}
