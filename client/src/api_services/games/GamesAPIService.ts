import axios from "axios";
import type { ApiResponse, IGamesAPIService } from "./IGamesAPIService";
import type { CreateGameDto, GameDto, UpdateGameDto } from "../../models/game/GameTypes";
import { readItem } from "../../helpers/local_storage";

const BASE = import.meta.env.VITE_API_URL + "games";

const authHeader = () => {
  const token = readItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const err = <T>(e: unknown, fallback: string): ApiResponse<T> => ({
  success: false,
  message: axios.isAxiosError(e) ? (e.response?.data as { message?: string })?.message ?? fallback : fallback,
});

export const gamesApi: IGamesAPIService = {
  async getAll() {
    return axios.get<ApiResponse<GameDto[]>>(BASE, { headers: authHeader() })
      .then((r) => r.data).catch((e) => err(e, "Failed to load games"));
  },
  async getById(id) {
    return axios.get<ApiResponse<GameDto>>(`${BASE}/${id}`, { headers: authHeader() })
      .then((r) => r.data).catch((e) => err(e, "Failed to load game"));
  },
  async create(payload: CreateGameDto) {
    return axios.post<ApiResponse<GameDto>>(BASE, payload, { headers: authHeader() })
      .then((r) => r.data).catch((e) => err(e, "Failed to create game"));
  },
  async update(id: number, payload: UpdateGameDto) {
    return axios.put<ApiResponse<GameDto>>(`${BASE}/${id}`, payload, { headers: authHeader() })
      .then((r) => r.data).catch((e) => err(e, "Failed to update game"));
  },
  async delete(id: number) {
    return axios.delete<ApiResponse<void>>(`${BASE}/${id}`, { headers: authHeader() })
      .then((r) => r.data).catch((e) => err(e, "Failed to delete game"));
  },
};