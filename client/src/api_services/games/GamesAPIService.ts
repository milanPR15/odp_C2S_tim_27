import axios from "axios";
import type { ApiResponse, IGamesAPIService } from "./IGamesAPIService";
import type { CreateGameDto, GameDto, UpdateGameDto } from "../../models/game/GameTypes";
import { authHeader, handleError } from "../ApiUtils";

const BASE = import.meta.env.VITE_API_URL + "games";

export const gamesApi: IGamesAPIService = {
  async getAll() {
    return axios.get<ApiResponse<GameDto[]>>(BASE, { headers: authHeader() })
      .then((r) => r.data).catch((e) => handleError(e, "Failed to load games"));
  },
  async getById(id) {
    return axios.get<ApiResponse<GameDto>>(`${BASE}/${id}`, { headers: authHeader() })
      .then((r) => r.data).catch((e) => handleError(e, "Failed to load game"));
  },
  async create(payload: CreateGameDto) {
    return axios.post<ApiResponse<GameDto>>(BASE, payload, { headers: authHeader() })
      .then((r) => r.data).catch((e) => handleError(e, "Failed to create game"));
  },
  async update(id: number, payload: UpdateGameDto) {
    return axios.put<ApiResponse<GameDto>>(`${BASE}/${id}`, payload, { headers: authHeader() })
      .then((r) => r.data).catch((e) => handleError(e, "Failed to update game"));
  },
  async delete(id: number) {
    return axios.delete<ApiResponse<void>>(`${BASE}/${id}`, { headers: authHeader() })
      .then((r) => r.data).catch((e) => handleError(e, "Failed to delete game"));
  },
};