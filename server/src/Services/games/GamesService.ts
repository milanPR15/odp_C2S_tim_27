import { CreateGameDto } from "../../Domain/DTOs/games/CreateGameDto";
import { GameDto } from "../../Domain/DTOs/games/GameDto";
import { Game } from "../../Domain/models/Game";
import { IGamesRepository } from "../../Domain/repositories/games/IGamesRepository";
import { IGamesService } from "../../Domain/services/games/IGamesService";

export class GameService implements IGamesService {
    public constructor(
        private gamesRepository: IGamesRepository
    ){}

    private toGameDto(game: Game): GameDto {
        return new GameDto(
            game.game_id,
            game.title,
            game.genre,
            game.max_players,
            game.logo,
            game.createdAt,
            game.updatedAt
        );
    }

    async getAll(): Promise<GameDto[]> {
        return this.gamesRepository.getAll().then(games => games.map(this.toGameDto));
    }
    async getById(id: number): Promise<GameDto | null> {
        const game = await this.gamesRepository.getById(id);
        return game ? this.toGameDto(game) : null;
    }
    async create(game: CreateGameDto): Promise<GameDto | null> {
        const created = await this.gamesRepository.create(new Game(
            0,
            game.title,
            game.genre,
            game.max_players,
            game.logo
        ));

        if (!created || created.game_id === 0) return null;
        return this.toGameDto(created);
    }
    async update(id: number, game: GameDto): Promise<GameDto | null> {
        const existing = await this.gamesRepository.getById(id);
        if (!existing) return null;
        const success = await this.gamesRepository.update(new Game(
            id,
            game.title,
            game.genre,
            game.max_players,
            game.logo
        ));
        if (!success) return null;
        const updated = await this.gamesRepository.getById(id);
        return updated ? this.toGameDto(updated) : null;
    }
    async delete(id: number): Promise<boolean> {
        const existing = await this.gamesRepository.getById(id);
        if (!existing) return false;
        return this.gamesRepository.delete(id);
    }
}