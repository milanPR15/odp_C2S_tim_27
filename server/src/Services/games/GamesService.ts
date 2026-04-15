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

    getAll(): Promise<GameDto[]> {
        return this.gamesRepository.getAll().then(games => games.map(this.toGameDto));
    }
    getById(id: number): Promise<GameDto | null> {
        return this.gamesRepository.getById(id).then(game => game ? this.toGameDto(game) : null);
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
    update(id: number, game: GameDto): Promise<GameDto | null> {
        return this.gamesRepository.getById(id).then(existing => {
            if (!existing) return null;
            return this.gamesRepository.update(new Game(
                id,
                game.title,
                game.genre,
                game.max_players,
                game.logo
            )).then(updated => {
                if (!updated) return null;
                return this.gamesRepository.getById(id).then(updatedGame => updatedGame ? this.toGameDto(updatedGame) : null);
            });
        });
    }
    delete(id: number): Promise<boolean> {
        return this.gamesRepository.getById(id).then(existing => {
            if (!existing) return false;
            return this.gamesRepository.delete(id);
        });
    }
}