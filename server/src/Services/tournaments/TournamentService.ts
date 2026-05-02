import { CreateTournamentDto } from "../../Domain/DTOs/tournaments/CreateTournamentDto";
import { TournamentDto } from "../../Domain/DTOs/tournaments/TournamentDto";
import { UpdateTournamentDto } from "../../Domain/DTOs/tournaments/UpdateTournamentDto";
import { Tournament } from "../../Domain/models/Tournament";
import { ITournamentRepository } from "../../Domain/repositories/tournaments/ITournamentRepository";
import { ITournamentService } from "../../Domain/services/tournaments/ITournamentService";

export class TournamentService implements ITournamentService {
    public constructor(private readonly tournamentRepository: ITournamentRepository) {}

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

    async getAll(): Promise<TournamentDto[]> {
        const tournaments = await this.tournamentRepository.findAll();
        return tournaments.map(this.mapToDto);
    }
    async getById(id: number): Promise<TournamentDto | null> {
        const tournament = await this.tournamentRepository.findById(id);
        return tournament ? this.mapToDto(tournament) : null;
    }
    async getByGameId(gameId: number): Promise<TournamentDto[]> {
        const tournaments = await this.tournamentRepository.findByGameId(gameId);
        return tournaments.map(this.mapToDto);
    }
    async create(tournament: CreateTournamentDto): Promise<TournamentDto | null> {
        const byName = await this.tournamentRepository.findByName(tournament.name);
        if (byName.tournament_id !== 0) return null;

        const entryDeadline = this.parseEntryDeadline(tournament.entry_deadline);
        if (!entryDeadline) return null;

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

        if (created.tournament_id === 0) return null;
        return this.mapToDto(created);
    }
    async update(id: number, tournament: UpdateTournamentDto): Promise<TournamentDto | null> {
        const existing = await this.tournamentRepository.findById(id);
        if (!existing) return null;
        const success = await this.tournamentRepository.update(new Tournament(
            id,
            tournament.name,
            tournament.game_id,
            tournament.format,
            tournament.max_teams,
            this.parseEntryDeadline(tournament.entry_deadline) || existing.entry_deadline,
            tournament.prize_pool,
            tournament.status
        ));
        if (!success) return null;
        const updated = await this.tournamentRepository.findById(id);
        return updated ? this.mapToDto(updated) : null;

    }
    async delete(id: number): Promise<boolean> {
        const existing = await this.tournamentRepository.findById(id);
        if (!existing) return false;
        return this.tournamentRepository.delete(id);
    }
}