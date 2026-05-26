import { IWatchlistService } from "../../Domain/services/watchlists/IWatchlistService";
import { IUserWatchlistReadRepository } from "../../Domain/repositories/watchlists/IUserWatchlistReadRepository";
import { IUserWatchlistWriteRepository } from "../../Domain/repositories/watchlists/IUserWatchlistWriteRepository";
import { ITournamentReadRepository } from "../../Domain/repositories/tournaments/ITournamentReadRepository";
import { IGamesReadRepository } from "../../Domain/repositories/games/IGamesReadRepository";
import { Result } from "../../Domain/types/Result";
import { WatchlistTournamentDto } from "../../Domain/DTOs/watchlists/WatchlistTournamentDto";

export class WatchlistService implements IWatchlistService {
  constructor(
    private readonly watchlistReadRepository: IUserWatchlistReadRepository,
    private readonly watchlistWriteRepository: IUserWatchlistWriteRepository,
    private readonly tournamentReadRepository: ITournamentReadRepository,
    private readonly gamesReadRepository: IGamesReadRepository,
  ) {}

  async getForUser(userId: number): Promise<Result<WatchlistTournamentDto[]>> {
    const entries = await this.watchlistReadRepository.findByUserId(userId);
    const result: WatchlistTournamentDto[] = [];

    for (const e of entries) {
      const tournament = await this.tournamentReadRepository.findById(e.tournament_id);
      if (!tournament.tournament_id) continue;
      const game = await this.gamesReadRepository.getById(tournament.game_id);

      result.push(new WatchlistTournamentDto(
        e.id,
        e.user_id,
        e.tournament_id,
        tournament.name,
        game.game_id || 0,
        game.title || "",
        game.logo || "",
        tournament.format,
        tournament.max_teams,
        tournament.entry_deadline,
        tournament.prize_pool,
        tournament.status,
        e.added_at
      ));
    }

    return { success: true, data: result };
  }

  async follow(userId: number, tournamentId: number): Promise<Result<void>> {
    const tournament = await this.tournamentReadRepository.findById(tournamentId);
    if (!tournament.tournament_id) {
      return { success: false, statusCode: 404, error: `Tournament with ID ${tournamentId} not found.` };
    }

    const alreadyFollowing = await this.watchlistReadRepository.exists(userId, tournamentId);
    if (alreadyFollowing) {
      return { success: false, statusCode: 409, error: "Tournament is already in your watchlist." };
    }

    const created = await this.watchlistWriteRepository.create(userId, tournamentId);
    if (!created) {
      return { success: false, statusCode: 500, error: "Failed to add tournament to watchlist." };
    }

    return { success: true, data: undefined };
  }

  async unfollow(userId: number, tournamentId: number): Promise<Result<void>> {
    const removed = await this.watchlistWriteRepository.delete(userId, tournamentId);
    if (!removed) {
      return { success: false, statusCode: 404, error: "Tournament is not in your watchlist." };
    }

    return { success: true, data: undefined };
  }
}