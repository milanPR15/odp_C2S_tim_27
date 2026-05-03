import { CreateGameDto } from "../../DTOs/games/CreateGameDto";
import { GameDto } from "../../DTOs/games/GameDto";
import { Result } from "../../types/Result";

export interface IGamesService {
  getAll(): Promise<Result<GameDto[]>>;
  getById(id: number): Promise<Result<GameDto | null>>;
    create(game: CreateGameDto, userId?: number): Promise<Result<GameDto | null>>;
    update(id: number, game: GameDto, userId?: number): Promise<Result<GameDto | null>>;
    delete(id: number, userId?: number): Promise<Result<boolean>>;
}