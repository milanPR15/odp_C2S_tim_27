import axios from "axios";
import type {
  AddPlayerToMatchPayload,
  ApiResponse,
  IMatchesAPIService,
  MatchDto,
  UpdateMatchResultPayload,
} from "./IMatchesAPIService";
import { authHeader, handleError } from "../ApiUtils";

const BASE = import.meta.env.VITE_API_URL + "matches";

export const matchesApi: IMatchesAPIService = {
  async getMatchesByTournament(tournamentId: number) {
    return axios.get<ApiResponse<MatchDto[]>>(`${BASE}/tournament/${tournamentId}`)
      .then((r) => r.data)
      .catch((e) => handleError(e, "Failed to load matches"));
  },

  async getMatchById(id: number) {
    return axios.get<ApiResponse<MatchDto>>(`${BASE}/${id}`)
      .then((r) => r.data)
      .catch((e) => handleError(e, "Failed to load match"));
  },

  async updateMatchResult(id: number, payload: UpdateMatchResultPayload) {
    return axios.patch<ApiResponse<void>>(`${BASE}/${id}/result`, payload, { headers: authHeader() })
      .then((r) => r.data)
      .catch((e) => handleError(e, e.response?.data?.message ?? "Failed to update match result"));
  },

  async generateMatches(tournamentId: number) {
    return axios.post<ApiResponse<void>>(`${BASE}/tournament/${tournamentId}/generate`, {}, { headers: authHeader() })
      .then((r) => r.data)
      .catch((e) => handleError(e, e.response?.data?.message ?? "Failed to generate matches"));
  },

  async addPlayerToMatch(id: number, payload: AddPlayerToMatchPayload) {
    return axios.post<ApiResponse<void>>(`${BASE}/${id}/players`, payload, { headers: authHeader() })
      .then((r) => r.data)
      .catch((e) => handleError(e, e.response?.data?.message ?? "Failed to add player to match"));
  },

  async removePlayerFromMatch(id: number, userId: number) {
    return axios.delete<ApiResponse<void>>(`${BASE}/${id}/players/${userId}`, { headers: authHeader() })
      .then((r) => r.data)
      .catch((e) => handleError(e, e.response?.data?.message ?? "Failed to remove player from match"));
  },
};
