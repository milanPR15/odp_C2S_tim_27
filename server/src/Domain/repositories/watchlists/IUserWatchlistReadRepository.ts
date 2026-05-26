import { WatchlistTournamentDto } from "../../DTOs/watchlists/WatchlistTournamentDto";

export interface IUserWatchlistReadRepository {
  findByUserId(userId: number): Promise<WatchlistTournamentDto[]>;
  exists(userId: number, tournamentId: number): Promise<boolean>;
}
