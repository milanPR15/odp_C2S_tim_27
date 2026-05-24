import { Game } from "../../models/Game";

export interface IGamesWriteRepository {
  create(game: Game): Promise<Game | null>;
  update(game: Game): Promise<boolean>;
  delete(id: number): Promise<boolean>;
}