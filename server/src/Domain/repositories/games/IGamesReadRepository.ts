import { Game } from "../../models/Game";

export interface IGamesReadRepository {
  getById(id: number): Promise<Game | null>;
  getByName(name: string): Promise<Game | null>;
  getAll(): Promise<Game[]>;
}