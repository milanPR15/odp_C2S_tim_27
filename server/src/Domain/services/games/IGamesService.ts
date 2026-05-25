import { CreateGameDto } from "../../DTOs/games/CreateGameDto";
import { GameDto } from "../../DTOs/games/GameDto";
import { Result } from "../../types/Result";

export interface IGamesService {
  getAll(): Promise<Result<GameDto[]>>;
  getById(id: number): Promise<Result<GameDto>>;
  create(game: CreateGameDto, userId?: number): Promise<Result<GameDto>>;
  update(id: number, game: GameDto, userId?: number): Promise<Result<GameDto>>;
  delete(id: number, userId?: number): Promise<Result<boolean>>;
}