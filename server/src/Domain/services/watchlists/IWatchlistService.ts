import { WatchlistTournamentDto } from "../../DTOs/watchlists/WatchlistTournamentDto";
import { Result } from "../../types/Result";

export interface IWatchlistService {
  getForUser(userId: number): Promise<Result<WatchlistTournamentDto[]>>;
  follow(userId: number, tournamentId: number): Promise<Result<void>>;
  unfollow(userId: number, tournamentId: number): Promise<Result<void>>;
}