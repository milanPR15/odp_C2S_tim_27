import { UserWatchlist } from "../../models/UserWatchlist";

export interface IUserWatchlistReadRepository {
  findByUserId(userId: number): Promise<UserWatchlist[]>;
  exists(userId: number, tournamentId: number): Promise<boolean>;
}
