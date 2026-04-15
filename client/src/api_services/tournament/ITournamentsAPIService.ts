import type { CreateTournamentDto, TournamentDto, UpdateTournamentDto } from '../../models/tournament/TournamentTypes';

export type ApiResponse<T> = { success: boolean; message: string; data?: T };

export interface ITournamentAPIService{
    getAll(): Promise<ApiResponse<TournamentDto[]>>;
    getById(id: number): Promise<ApiResponse<TournamentDto>>;
    create(tournament: CreateTournamentDto): Promise<ApiResponse<TournamentDto>>;
    update(id: number, tournament: UpdateTournamentDto): Promise<ApiResponse<TournamentDto>>;
    delete(id: number): Promise<ApiResponse<void>>;
}