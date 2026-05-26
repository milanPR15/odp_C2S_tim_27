import { UserWatchlist } from "../../models/UserWatchlist";

export interface IUserWatchlistRepository {
  findByUserId(userId: number): Promise<UserWatchlist[]>;
  exists(userId: number, tournamentId: number): Promise<boolean>;
  create(userId: number, tournamentId: number): Promise<boolean>;
  delete(userId: number, tournamentId: number): Promise<boolean>;
}