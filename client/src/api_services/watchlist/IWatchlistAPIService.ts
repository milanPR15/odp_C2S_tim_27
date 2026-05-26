import type { WatchlistTournamentDto } from "../../models/watchlist/WatchlistTypes";

export type ApiResponse<T> = { success: boolean; message: string; data?: T };

export interface IWatchlistAPIService {
  getMine(): Promise<ApiResponse<WatchlistTournamentDto[]>>;
  follow(tournamentId: number): Promise<ApiResponse<void>>;
  unfollow(tournamentId: number): Promise<ApiResponse<void>>;
}