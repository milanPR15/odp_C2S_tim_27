import { ValidationResult } from "../../../Domain/types/ValidationResult";
import { UpdateMatchResultDto } from "../../../Domain/DTOs/matches/UpdateMatchResultDto";

export const validateUpdateMatchResult = (dto: UpdateMatchResultDto): ValidationResult => {
  if (!dto || !dto.result) {
    return { valid: false, message: "Rezultat meča je obavezan (npr. 2:1)" };
  }

  if (!/^\d+:\d+$/.test(dto.result.trim())) {
    return { valid: false, message: "Rezultat mora biti u formatu X:Y (npr. 2:1, 3:0)" };
  }

  const [score1, score2] = dto.result.split(':').map(Number);
  if (score1 < 0 || score2 < 0) {
    return { valid: false, message: "Broj golova/poena ne može biti negativan" };
  }

  return { valid: true };
};