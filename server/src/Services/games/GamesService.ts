import { CreateGameDto } from "../../Domain/DTOs/games/CreateGameDto";
import { GameDto } from "../../Domain/DTOs/games/GameDto";
import { Game } from "../../Domain/models/Game";
import { IGamesReadRepository } from "../../Domain/repositories/games/IGamesReadRepository";
import { IGamesWriteRepository } from "../../Domain/repositories/games/IGamesWriteRepository";
import { IGamesService } from "../../Domain/services/games/IGamesService";
import { IAuditLogService } from "../../Domain/services/auditLogs/IAuditLogService";
import { Result } from '../../Domain/types/Result';

export class GameService implements IGamesService {
    public constructor(
        private gamesReadRepository: IGamesReadRepository,
        private gamesWriteRepository: IGamesWriteRepository,
        private auditLogService: IAuditLogService
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

    async getAll(): Promise<Result<GameDto[]>> {
        try {
            const games = await this.gamesReadRepository.getAll();
            return { success: true, data: games.map(this.toGameDto) };
        } catch (error) {
            return { success: false, error: "Failed to retrieve games", statusCode: 500 };
        }
    }
    async getById(id: number): Promise<Result<GameDto | null>> {
        try {
            const game = await this.gamesReadRepository.getById(id);
            return { success: true, data: game ? this.toGameDto(game) : null };
        } catch (error) {
            return { success: false, error: "Failed to retrieve game", statusCode: 500 };
        }
    }
    async create(game: CreateGameDto, userId: number = 0): Promise<Result<GameDto | null>> {
        try {
            const existing = await this.gamesReadRepository.getByName(game.title);
            if (existing) {
                return { success: false, error: `Game with title '${game.title}' already exists`, statusCode: 409 };
            }

            const created = await this.gamesWriteRepository.create(new Game(
                0,
                game.title,
                game.genre,
                game.max_players,
                game.logo
            ));
            
            if (created) {
                await this.auditLogService.log(
                    userId,
                    "CREATE",
                    "Game",
                    created.game_id,
                    JSON.stringify({ title: game.title, genre: game.genre })
                );
            }

            return { success: true, data: created ? this.toGameDto(created) : null };
        } catch (error) {
            return { success: false, error: "Failed to create game", statusCode: 500 };
        }
    }
    async update(id: number, game: GameDto, userId: number = 0): Promise<Result<GameDto | null>> {
        try {
            const existing = await this.gamesReadRepository.getById(id);
            if (!existing) {
                return { success: false, error: "Game not found", statusCode: 404 };
            }
            const success = await this.gamesWriteRepository.update(new Game(
                id,
                game.title,
                game.genre,
                game.max_players,
                game.logo
            ));
            if (!success) {
                return { success: false, error: "Failed to update game", statusCode: 500 };
            }

            await this.auditLogService.log(
                userId,
                "UPDATE",
                "Game",
                id,
                JSON.stringify({ title: game.title, genre: game.genre })
            );

            const updated = await this.gamesReadRepository.getById(id);
            return { success: true, data: updated ? this.toGameDto(updated) : null };
        } catch (error) {
            return { success: false, error: "Failed to update game", statusCode: 500 };
        }
    }
    async delete(id: number, userId: number = 0): Promise<Result<boolean>> {
        try {
            const existing = await this.gamesReadRepository.getById(id);
            if (!existing) {
                return { success: false, error: "Game not found", statusCode: 404 };
            }
            const result = await this.gamesWriteRepository.delete(id);
            
            if (result) {
                await this.auditLogService.log(
                    userId,
                    "DELETE",
                    "Game",
                    id
                );
            }

            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: "Failed to delete game", statusCode: 500 };
        }
    }
}