import { WatchlistTournamentDto } from "../../DTOs/watchlists/WatchlistTournamentDto";

export interface IUserWatchlistRepository {
  findByUserId(userId: number): Promise<WatchlistTournamentDto[]>;
  exists(userId: number, tournamentId: number): Promise<boolean>;
  create(userId: number, tournamentId: number): Promise<boolean>;
  delete(userId: number, tournamentId: number): Promise<boolean>;
}