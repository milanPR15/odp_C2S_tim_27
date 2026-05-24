import { Tournament } from "../../models/Tournament";

export interface ITournamentWriteRepository {
  create(tournament: Tournament): Promise<Tournament>;
  update(tournament?: Tournament): Promise<boolean>;
  delete(id: number): Promise<boolean>;
}