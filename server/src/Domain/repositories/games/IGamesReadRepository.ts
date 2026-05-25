import { Game } from "../../models/Game";

export interface IGamesReadRepository {
  getById(id: number): Promise<Game>;
  getByName(name: string): Promise<Game>;
  getAll(): Promise<Game[]>;
}