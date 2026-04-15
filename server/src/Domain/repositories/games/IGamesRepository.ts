import { Game } from "../../models/Game";

export interface IGamesRepository {
  create(game: Game): Promise<Game | null>;
  getById(id: number): Promise<Game | null>;
  getByName(name: string): Promise<Game | null>;
  getAll(): Promise<Game[]>;
  update(game: Game): Promise<boolean>;
  delete(id: number): Promise<boolean>;
}