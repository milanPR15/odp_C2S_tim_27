import axios from "axios";
import type { ApiResponse, ITournamentAPIService } from "./ITournamentsAPIService";
import type { CreateTournamentDto, TournamentDto, UpdateTournamentDto } from "../../models/tournament/TournamentTypes";
import { authHeader, handleError } from "../ApiUtils";

const BASE = import.meta.env.VITE_API_URL + "tournaments";

export const tournamentApi: ITournamentAPIService = {
    async getAll() {
        return axios.get<ApiResponse<TournamentDto[]>>(BASE, { headers: authHeader() })
            .then(r => r.data).catch(e => handleError(e, "Failed to load tournaments"));
    },
    getById: function (id: number): Promise<ApiResponse<TournamentDto>> {
        return axios.get<ApiResponse<TournamentDto>>(`${BASE}/${id}`, { headers: authHeader() })
            .then(r => r.data).catch(e => handleError(e, "Failed to load tournament"));
    },
    getByGameId: function (gameId: number): Promise<ApiResponse<TournamentDto[]>> {
        return axios.get<ApiResponse<TournamentDto[]>>(`${BASE}/game/${gameId}`, { headers: authHeader() })
            .then(r => r.data).catch(e => handleError(e, "Failed to load tournaments for game"));
    },
    create: function (tournament: CreateTournamentDto): Promise<ApiResponse<TournamentDto>> {
        return axios.post<ApiResponse<TournamentDto>>(BASE, tournament, { headers: authHeader() })
            .then(r => r.data).catch(e => handleError(e, "Failed to create tournament"));
    },
    update: function (id: number, tournament: UpdateTournamentDto): Promise<ApiResponse<TournamentDto>> {
        return axios.put<ApiResponse<TournamentDto>>(`${BASE}/${id}`, tournament, { headers: authHeader() })
            .then(r => r.data).catch(e => handleError(e, "Failed to update tournament"));
    },
    delete: function (id: number): Promise<ApiResponse<void>> {
        return axios.delete<ApiResponse<void>>(`${BASE}/${id}`, { headers: authHeader() })
            .then(r => r.data).catch(e => handleError(e, "Failed to delete tournament"));
    }
}