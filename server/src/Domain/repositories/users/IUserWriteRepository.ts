import { UpdateProfileDto } from "../../DTOs/account/UpdateProfileDto";
import { User } from "../../models/User";

export interface IUserWriteRepository {
  create(user: User): Promise<User>;
  update(user: User): Promise<boolean>;
  deactivate(id: number): Promise<boolean>;
  updateProfile(userId: number, dto: UpdateProfileDto): Promise<boolean>;
}
