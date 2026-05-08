import { CreateTournamentDto } from "../../Domain/DTOs/tournaments/CreateTournamentDto";
import { TournamentDto } from "../../Domain/DTOs/tournaments/TournamentDto";
import { UpdateTournamentDto } from "../../Domain/DTOs/tournaments/UpdateTournamentDto";
import { Tournament } from "../../Domain/models/Tournament";
import { ITournamentRepository } from "../../Domain/repositories/tournaments/ITournamentRepository";
import { ITournamentService } from "../../Domain/services/tournaments/ITournamentService";
import { IAuditLogService } from "../../Domain/services/auditLogs/IAuditLogService";
import { Result } from "../../Domain/types/Result";

export class TournamentService implements ITournamentService {
    public constructor(
        private readonly tournamentRepository: ITournamentRepository,
        private readonly auditLogService: IAuditLogService
    ) {}

    private parseEntryDeadline(rawValue: unknown): Date | null {
        if (rawValue instanceof Date) {
            return Number.isNaN(rawValue.getTime()) ? null : rawValue;
        }

        if (typeof rawValue === "string" || typeof rawValue === "number") {
            const parsed = new Date(rawValue);
            return Number.isNaN(parsed.getTime()) ? null : parsed;
        }

        return null;
    }

    private mapToDto(t: Tournament): TournamentDto {
        return new TournamentDto(
            t.tournament_id,
            t.name,
            t.game_id,
            t.format,
            t.max_teams,
            t.entry_deadline,
            t.prize_pool,
            t.status,
            t.createdAt,
            t.updatedAt,
        );
    }

    async getAll(): Promise<Result<TournamentDto[]>> {
        const tournaments = await this.tournamentRepository.findAll();
        return { success: true, data: tournaments.map(this.mapToDto) };
    }

    async getById(id: number): Promise<Result<TournamentDto>> {
        const tournament = await this.tournamentRepository.findById(id);
        if (!tournament) {
            return { success: false, statusCode: 404, error: `Tournament with ID ${id} not found.` };
        }
        return { success: true, data: this.mapToDto(tournament) };
    }

    async getByGameId(gameId: number): Promise<Result<TournamentDto[]>> {
        const tournaments = await this.tournamentRepository.findByGameId(gameId);
        return { success: true, data: tournaments.map(this.mapToDto) };
    }

    async create(tournament: CreateTournamentDto, userId: number = 0): Promise<Result<TournamentDto>> {
        const byName = await this.tournamentRepository.findByName(tournament.name);
        if (byName.tournament_id !== 0) {
            return { success: false, statusCode: 409, error: `Tournament with name '${tournament.name}' already exists.` };
        }

        const entryDeadline = this.parseEntryDeadline(tournament.entry_deadline);
        if (!entryDeadline) {
            return { success: false, statusCode: 400, error: "Invalid entry deadline format string provided." };
        }

        const created = await this.tournamentRepository.create(
            new Tournament(
                0,
                tournament.name,
                tournament.game_id,
                tournament.format,
                tournament.max_teams,
                entryDeadline,
                tournament.prize_pool,
                tournament.status,
            )
        );

        if (created.tournament_id === 0) {
            return { success: false, statusCode: 500, error: "Failed to insert the tournament into the database." };
        }
        
        await this.auditLogService.log(
            userId,
            "CREATE",
            "Tournament",
            created.tournament_id,
            JSON.stringify({ name: tournament.name, game_id: tournament.game_id })
        );

        return { success: true, data: this.mapToDto(created) };
    }

    async update(id: number, tournament: UpdateTournamentDto, userId: number = 0): Promise<Result<TournamentDto>> {
        const existing = await this.tournamentRepository.findById(id);
        if (!existing) {
            return { success: false, statusCode: 404, error: `Tournament with ID ${id} not found.` };
        }

        const success = await this.tournamentRepository.update(new Tournament(
            id,
            tournament.name ?? existing.name,
            tournament.game_id ?? existing.game_id,
            tournament.format ?? existing.format,
            tournament.max_teams ?? existing.max_teams,
            this.parseEntryDeadline(tournament.entry_deadline) || existing.entry_deadline,
            tournament.prize_pool ?? existing.prize_pool,
            tournament.status ?? existing.status
        ));

        if (!success) {
            return { success: false, statusCode: 500, error: "Failed to update the tournament in the database." };
        }

        await this.auditLogService.log(
            userId,
            "UPDATE",
            "Tournament",
            id,
            JSON.stringify({ name: tournament.name, game_id: tournament.game_id })
        );

        const updated = await this.tournamentRepository.findById(id);
        if (!updated) {
            return { success: false, statusCode: 500, error: "Tournament was updated but failed to retrieve the updated data." };
        }
        return { success: true, data: this.mapToDto(updated) };
    }

    async delete(id: number, userId: number = 0): Promise<Result<void>> {
        const existing = await this.tournamentRepository.findById(id);
        if (!existing) {
            return { success: false, statusCode: 404, error: `Tournament with ID ${id} not found.` };
        }
        const success = await this.tournamentRepository.delete(id);
        if (!success) {
            return { success: false, statusCode: 500, error: "Failed to delete the tournament from the database." };
        }
        
        await this.auditLogService.log(
            userId,
            "DELETE",
            "Tournament",
            id
        );

        return { success: true, data: undefined };
    }
}