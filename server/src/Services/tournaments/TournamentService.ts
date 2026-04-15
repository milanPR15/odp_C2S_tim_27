import { CreateTournamentDto } from "../../Domain/DTOs/tournaments/CreateTournamentDto";
import { TournamentDto } from "../../Domain/DTOs/tournaments/TournamentDto";
import { UpdateTournamentDto } from "../../Domain/DTOs/tournaments/UpdateTournamentDto";
import { Tournament } from "../../Domain/models/Tournament";
import { ITournamentRepository } from "../../Domain/repositories/tournaments/ITournamentRepository";
import { ITournamentService } from "../../Domain/services/tournaments/ITournamentService";

export class TournamentService implements ITournamentService {
    public constructor(private readonly tournamentRepository: ITournamentRepository) {}

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

    getAll(): Promise<TournamentDto[]> {
        throw new Error("Method not implemented.");
    }
    getById(id: number): Promise<TournamentDto | null> {
        throw new Error("Method not implemented.");
    }
    async create(tournament: CreateTournamentDto): Promise<TournamentDto | null> {
        const byName = await this.tournamentRepository.findByName(tournament.name);
        if (byName.tournament_id !== 0) return null;

        const created = await this.tournamentRepository.create(
            new Tournament(
                0,
                tournament.name,
                tournament.game_id,
                tournament.format,
                tournament.max_teams,
                tournament.entry_deadline,
                tournament.prize_pool,
                tournament.status,
            )
        );

        if (created.tournament_id === 0) return null;
        return this.mapToDto(created);
    }
    update(id: number, tournament: UpdateTournamentDto): Promise<TournamentDto | null> {
        throw new Error("Method not implemented.");
    }
    delete(id: number): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
}