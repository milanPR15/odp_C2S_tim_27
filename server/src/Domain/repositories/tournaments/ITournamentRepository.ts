import { Tournament } from "../../models/Tournament";

export interface ITournamentRepository {
  create(tournament: Tournament): Promise<Tournament>;
  findById(id: number): Promise<Tournament | null>;
  findByGameId(gameId: number): Promise<Tournament[]>;
  findByName(name: string): Promise<Tournament>;
  findAll(): Promise<Tournament[]>;
  update(tournament?: Tournament): Promise<boolean>;
  delete(id: number): Promise<boolean>;
}