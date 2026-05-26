import { CreateTournamentDto } from "../../Domain/DTOs/tournaments/CreateTournamentDto";
import { TournamentDto } from "../../Domain/DTOs/tournaments/TournamentDto";
import { UpdateTournamentDto } from "../../Domain/DTOs/tournaments/UpdateTournamentDto";
import { RegisterTournamentTeamDto } from "../../Domain/DTOs/tournaments/RegisterTournamentTeamDto";
import { Tournament } from "../../Domain/models/Tournament";
import { ITournamentReadRepository } from "../../Domain/repositories/tournaments/ITournamentReadRepository";
import { ITournamentWriteRepository } from "../../Domain/repositories/tournaments/ITournamentWriteRepository";
import { ITournamentService } from "../../Domain/services/tournaments/ITournamentService";
import { IAuditLogService } from "../../Domain/services/auditLogs/IAuditLogService";
import { IGamesReadRepository } from "../../Domain/repositories/games/IGamesReadRepository";
import { ITeamReadRepository } from "../../Domain/repositories/teams/ITeamReadRepository";
import { ITournamentRegistrationReadRepository } from "../../Domain/repositories/tournaments/ITournamentRegistrationReadRepository";
import { ITournamentRegistrationWriteRepository } from "../../Domain/repositories/tournaments/ITournamentRegistrationWriteRepository";
import { TournamentRegistration } from "../../Domain/models/TournamentRegistration";
import { TournamentStatus } from "../../Domain/enums/TournamentStatus";
import { RegistrationStatus } from "../../Domain/enums/RegistrationStatus";
import { Result } from "../../Domain/types/Result";
import { IMatchService } from "../../Domain/services/matches/IMatchService";
import { TournamentRegistrationDto } from "../../Domain/DTOs/tournaments/TournamentRegistrationDto";

type EntryDeadlineInput = string | number | Date;

export class TournamentService implements ITournamentService {
    public constructor(
        private readonly tournamentReadRepository: ITournamentReadRepository,
        private readonly tournamentWriteRepository: ITournamentWriteRepository,
        private readonly gamesReadRepository: IGamesReadRepository,
        private readonly teamReadRepository: ITeamReadRepository,
        private readonly registrationReadRepository: ITournamentRegistrationReadRepository,
        private readonly registrationWriteRepository: ITournamentRegistrationWriteRepository,
        private readonly auditLogService: IAuditLogService,
        private readonly matchService: IMatchService
    ) {}

    private parseEntryDeadline(rawValue: EntryDeadlineInput): Date | undefined {
        if (rawValue instanceof Date) {
            return Number.isNaN(rawValue.getTime()) ? undefined : rawValue;
        }

        if (typeof rawValue === "string" || typeof rawValue === "number") {
            const parsed = new Date(rawValue);
            return Number.isNaN(parsed.getTime()) ? undefined : parsed;
        }

        return undefined;
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

    private async ensureMatchesGenerated(tournament: Tournament): Promise<Result<void>> {
        const confirmedCount = await this.registrationReadRepository.countConfirmedByTournament(tournament.tournament_id);
        if (confirmedCount < tournament.max_teams) {
            return { success: true, data: undefined };
        }

        const generationResult = await this.matchService.generateMatchesForTournament(tournament.tournament_id);
        if (!generationResult.success) {
            return generationResult;
        }

        if (tournament.status !== TournamentStatus.ONGOING) {
            const activated = await this.tournamentWriteRepository.update(new Tournament(
                tournament.tournament_id,
                tournament.name,
                tournament.game_id,
                tournament.format,
                tournament.max_teams,
                tournament.entry_deadline,
                tournament.prize_pool,
                TournamentStatus.ONGOING,
                tournament.createdAt,
                tournament.updatedAt
            ));

            if (!activated) {
                return { success: false, statusCode: 500, error: "Failed to activate the tournament after generating matches." };
            }
        }

        return { success: true, data: undefined };
    }

    async getAll(): Promise<Result<TournamentDto[]>> {
        const tournaments = await this.tournamentReadRepository.findAll();
        return { success: true, data: tournaments.map(this.mapToDto) };
    }

    async getById(id: number): Promise<Result<TournamentDto>> {
        const tournament = await this.tournamentReadRepository.findById(id);
        if (!tournament.tournament_id) {
            return { success: false, statusCode: 404, error: `Tournament with ID ${id} not found.` };
        }
        return { success: true, data: this.mapToDto(tournament) };
    }

    async getByGameId(gameId: number): Promise<Result<TournamentDto[]>> {
        const tournaments = await this.tournamentReadRepository.findByGameId(gameId);
        return { success: true, data: tournaments.map(this.mapToDto) };
    }

    async getRegistrationCount(id: number): Promise<Result<number>> {
        const tournament = await this.tournamentReadRepository.findById(id);
        if (!tournament.tournament_id) {
            return { success: false, statusCode: 404, error: `Tournament with ID ${id} not found.` };
        }

        const count = await this.registrationReadRepository.countByTournament(id);
        return { success: true, data: count };
    }

    async getRegistrations(id: number): Promise<Result<TournamentRegistrationDto[]>> {
        const tournament = await this.tournamentReadRepository.findById(id);
        if (!tournament.tournament_id) {
            return { success: false, statusCode: 404, error: `Tournament with ID ${id} not found.` };
        }

        const generationResult = await this.ensureMatchesGenerated(tournament);
        if (!generationResult.success) {
            return generationResult;
        }

        const registrations = await this.registrationReadRepository.findByTournament(id);
        return { success: true, data: registrations };
    }

    async create(tournament: CreateTournamentDto, userId: number = 0): Promise<Result<TournamentDto>> {
        const byName = await this.tournamentReadRepository.findByName(tournament.name);
        if (byName.tournament_id !== 0) {
            return { success: false, statusCode: 409, error: `Tournament with name '${tournament.name}' already exists.` };
        }

        const entryDeadline = this.parseEntryDeadline(tournament.entry_deadline);
        if (!entryDeadline) {
            return { success: false, statusCode: 400, error: "Invalid entry deadline format string provided." };
        }

        const created = await this.tournamentWriteRepository.create(
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
        const existing = await this.tournamentReadRepository.findById(id);
        if (!existing) {
            return { success: false, statusCode: 404, error: `Tournament with ID ${id} not found.` };
        }

        const success = await this.tournamentWriteRepository.update(new Tournament(
            id,
            tournament.name ?? existing.name,
            tournament.game_id ?? existing.game_id,
            tournament.format ?? existing.format,
            tournament.max_teams ?? existing.max_teams,
            this.parseEntryDeadline(tournament.entry_deadline!) || existing.entry_deadline,
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

        const updated = await this.tournamentReadRepository.findById(id);
        if (!updated) {
            return { success: false, statusCode: 500, error: "Tournament was updated but failed to retrieve the updated data." };
        }
        return { success: true, data: this.mapToDto(updated) };
    }

    async delete(id: number, userId: number = 0): Promise<Result<void>> {
        const existing = await this.tournamentReadRepository.findById(id);
        if (!existing) {
            return { success: false, statusCode: 404, error: `Tournament with ID ${id} not found.` };
        }
        const success = await this.tournamentWriteRepository.delete(id);
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

    async registerTeam(tournamentId: number, userId: number, dto: RegisterTournamentTeamDto): Promise<Result<void>> {
        if (!dto.isValid()) {
            return { success: false, statusCode: 400, error: "Invalid team registration payload." };
        }

        const tournament = await this.tournamentReadRepository.findById(tournamentId);
        if (!tournament.tournament_id) {
            return { success: false, statusCode: 404, error: `Tournament with ID ${tournamentId} not found.` };
        }

        const game = await this.gamesReadRepository.getById(tournament.game_id);
        if (!game) {
            return { success: false, statusCode: 404, error: "Game not found for this tournament." };
        }

        if (tournament.status !== TournamentStatus.UPCOMING) {
            return { success: false, statusCode: 400, error: "Tournament registrations are closed." };
        }

        if (new Date() > tournament.entry_deadline) {
            return { success: false, statusCode: 400, error: "The entry deadline has passed." };
        }

        const team = await this.teamReadRepository.findById(dto.teamId);
        if (!team.team_id) {
            return { success: false, statusCode: 404, error: "Team not found." };
        }

        const members = await this.teamReadRepository.findMembers(dto.teamId);
        const captain = members.find((member) => member.role === "captain");
        if (!captain || captain.user_id !== userId) {
            return { success: false, statusCode: 403, error: "Only the team captain can register the team." };
        }

        const alreadyRegistered = await this.registrationReadRepository.findByTournamentAndTeam(tournamentId, dto.teamId);
        if (alreadyRegistered.id !== 0) {
            return { success: false, statusCode: 409, error: "This team is already registered for this tournament." };
        }

        const confirmedCount = await this.registrationReadRepository.countByTournament(tournamentId);
        if (confirmedCount >= tournament.max_teams) {
            return { success: false, statusCode: 409, error: "The tournament has reached its maximum number of teams." };
        }

        const memberIds = new Set(members.map((member) => member.user_id));
        const selectedIds = new Set<number>(dto.playerIds.length > 0 ? dto.playerIds : members.map((member) => member.user_id));
        selectedIds.add(userId);

        if (selectedIds.size !== game.max_players) {
            return {
                success: false,
                statusCode: 400,
                error: `This game requires exactly ${game.max_players} players. You selected ${selectedIds.size}.`,
            };
        }

        for (const playerId of selectedIds) {
            if (!memberIds.has(playerId)) {
                return { success: false, statusCode: 400, error: "Selected players must belong to the team." };
            }
        }

        const registration = await this.registrationWriteRepository.create(new TournamentRegistration(
            0,
            tournamentId,
            dto.teamId,
            RegistrationStatus.PENDING,
            0,
            new Date(),
            Array.from(selectedIds)
        ));

        if (!registration.id) {
            return { success: false, statusCode: 500, error: "Failed to register team for the tournament." };
        }

        await this.auditLogService.log(
            userId,
            "REGISTER",
            "TournamentRegistration",
            registration.id,
            JSON.stringify({ tournamentId, teamId: dto.teamId, selectedPlayerIds: Array.from(selectedIds) })
        );

        return { success: true, data: undefined };
    }

    async confirmRegistration(tournamentId: number, registrationId: number, userId: number): Promise<Result<void>> {
        const tournament = await this.tournamentReadRepository.findById(tournamentId);
        if (!tournament.tournament_id) {
            return { success: false, statusCode: 404, error: `Tournament with ID ${tournamentId} not found.` };
        }

        const registration = await this.registrationReadRepository.findById(registrationId);
        if (!registration.id || registration.tournament_id !== tournamentId) {
            return { success: false, statusCode: 404, error: "Tournament registration not found." };
        }

        if (registration.status === RegistrationStatus.DISQUALIFIED) {
            return { success: false, statusCode: 400, error: "Disqualified registrations cannot be confirmed." };
        }

        if (tournament.status !== TournamentStatus.UPCOMING && tournament.status !== TournamentStatus.ONGOING) {
            return { success: false, statusCode: 400, error: "Tournament registrations are closed." };
        }

        const alreadyConfirmed = registration.status === RegistrationStatus.CONFIRMED;
        if (!alreadyConfirmed) {
            const updated = await this.registrationWriteRepository.updateStatus(registrationId, RegistrationStatus.CONFIRMED);
            if (!updated) {
                return { success: false, statusCode: 500, error: "Failed to confirm the tournament registration." };
            }
        }

        const generationResult = await this.ensureMatchesGenerated(tournament);
        if (!generationResult.success) {
            return {
                success: false,
                statusCode: generationResult.statusCode || 500,
                error: generationResult.error || "Failed to generate tournament matches.",
            };
        }

        await this.auditLogService.log(
            userId,
            "CONFIRM",
            "TournamentRegistration",
            registrationId,
            JSON.stringify({ tournamentId, teamId: registration.team_id, registrationStatus: RegistrationStatus.CONFIRMED })
        );

        return { success: true, data: undefined };
    }
}