import { Tournament } from "../../models/Tournament";

export interface ITournamentReadRepository {
  findById(id: number): Promise<Tournament>;
  findByGameId(gameId: number): Promise<Tournament[]>;
  findByName(name: string): Promise<Tournament>;
  findAll(): Promise<Tournament[]>;
}