import { CreateGameDto } from "../../DTOs/games/CreateGameDto";
import { GameDto } from "../../DTOs/games/GameDto";

export interface IGamesService {
  getAll(): Promise<GameDto[]>;
  getById(id: number): Promise<GameDto | null>;
  create(game: CreateGameDto): Promise<GameDto | null>;
  update(id: number, game: GameDto): Promise<GameDto | null>;
  delete(id: number): Promise<boolean>;
}