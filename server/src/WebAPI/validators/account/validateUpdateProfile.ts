import { ValidationResult } from "../../../Domain/types/ValidationResult";
import { UpdateProfileDto } from "../../../Domain/DTOs/account/UpdateProfileDto";

export const validateUpdateProfile = (dto: UpdateProfileDto): ValidationResult => {
  if (dto.gamer_tag) {
    if (dto.gamer_tag.length < 3 || dto.gamer_tag.length > 40) {
      return { valid: false, message: "Gamer tag has to be between 3 and 40 characters long" };
    }
    if (!/^[a-zA-Z0-9-]+$/.test(dto.gamer_tag)) {
      return { valid: false, message: "Gamer tag can only contain letters, numbers and hyphens (-)" };
    }
  }

  if (dto.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dto.email)) {
    return { valid: false, message: "Invalid email address" };
  }

  if (dto.password && dto.password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters long" };
  }

  if (dto.password && (!/[A-Z]/.test(dto.password) || !/[0-9]/.test(dto.password))) {
    return { valid: false, message: "Password must contain at least one uppercase letter and one number" };
  }

  return { valid: true };
};