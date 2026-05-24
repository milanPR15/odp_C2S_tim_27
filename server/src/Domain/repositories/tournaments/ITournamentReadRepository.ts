import { Tournament } from "../../models/Tournament";

export interface ITournamentReadRepository {
  findById(id: number): Promise<Tournament | null>;
  findByGameId(gameId: number): Promise<Tournament[]>;
  findByName(name: string): Promise<Tournament>;
  findAll(): Promise<Tournament[]>;
}