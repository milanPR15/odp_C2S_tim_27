import { IWatchlistService } from "../../Domain/services/watchlists/IWatchlistService";
import { IUserWatchlistRepository } from "../../Domain/repositories/watchlists/IUserWatchlistRepository";
import { ITournamentReadRepository } from "../../Domain/repositories/tournaments/ITournamentReadRepository";
import { Result } from "../../Domain/types/Result";
import { WatchlistTournamentDto } from "../../Domain/DTOs/watchlists/WatchlistTournamentDto";

export class WatchlistService implements IWatchlistService {
  constructor(
    private readonly watchlistRepository: IUserWatchlistRepository,
    private readonly tournamentReadRepository: ITournamentReadRepository,
  ) {}

  async getForUser(userId: number): Promise<Result<WatchlistTournamentDto[]>> {
    const items = await this.watchlistRepository.findByUserId(userId);
    return { success: true, data: items };
  }

  async follow(userId: number, tournamentId: number): Promise<Result<void>> {
    const tournament = await this.tournamentReadRepository.findById(tournamentId);
    if (!tournament.tournament_id) {
      return { success: false, statusCode: 404, error: `Tournament with ID ${tournamentId} not found.` };
    }

    const alreadyFollowing = await this.watchlistRepository.exists(userId, tournamentId);
    if (alreadyFollowing) {
      return { success: false, statusCode: 409, error: "Tournament is already in your watchlist." };
    }

    const created = await this.watchlistRepository.create(userId, tournamentId);
    if (!created) {
      return { success: false, statusCode: 500, error: "Failed to add tournament to watchlist." };
    }

    return { success: true, data: undefined };
  }

  async unfollow(userId: number, tournamentId: number): Promise<Result<void>> {
    const removed = await this.watchlistRepository.delete(userId, tournamentId);
    if (!removed) {
      return { success: false, statusCode: 404, error: "Tournament is not in your watchlist." };
    }

    return { success: true, data: undefined };
  }
}