import type { CreateTournamentDto, RegisterTournamentTeamDto, TournamentDto, TournamentRegistrationDto, UpdateTournamentDto } from '../../models/tournament/TournamentTypes';

export type ApiResponse<T> = { success: boolean; message: string; data?: T };

export interface ITournamentAPIService{
    getAll(): Promise<ApiResponse<TournamentDto[]>>;
    getById(id: number): Promise<ApiResponse<TournamentDto>>;
    getByGameId(gameId: number): Promise<ApiResponse<TournamentDto[]>>;
    getRegistrationCount(id: number): Promise<ApiResponse<number>>;
    getRegistrations(id: number): Promise<ApiResponse<TournamentRegistrationDto[]>>;
    create(tournament: CreateTournamentDto): Promise<ApiResponse<TournamentDto>>;
    update(id: number, tournament: UpdateTournamentDto): Promise<ApiResponse<TournamentDto>>;
    delete(id: number): Promise<ApiResponse<void>>;
    registerTeam(id: number, payload: RegisterTournamentTeamDto): Promise<ApiResponse<void>>;
    confirmRegistration(tournamentId: number, registrationId: number): Promise<ApiResponse<void>>;
}