import axios from "axios";
import { authHeader, handleError } from "../ApiUtils";
import type { ApiResponse, IWatchlistAPIService } from "./IWatchlistAPIService";
import type { WatchlistTournamentDto } from "../../models/watchlist/WatchlistTypes";

const BASE = import.meta.env.VITE_API_URL + "watchlist";

export const watchlistApi: IWatchlistAPIService = {
  async getMine() {
    return axios.get<ApiResponse<WatchlistTournamentDto[]>>(BASE, { headers: authHeader() })
      .then((r) => r.data)
      .catch((e) => handleError(e, "Failed to load your watchlist"));
  },
  async follow(tournamentId: number) {
    return axios.post<ApiResponse<void>>(`${BASE}/${tournamentId}`, {}, { headers: authHeader() })
      .then((r) => r.data)
      .catch((e) => handleError(e, e.response?.data?.message ?? "Failed to add tournament to watchlist"));
  },
  async unfollow(tournamentId: number) {
    return axios.delete<ApiResponse<void>>(`${BASE}/${tournamentId}`, { headers: authHeader() })
      .then((r) => r.data)
      .catch((e) => handleError(e, e.response?.data?.message ?? "Failed to remove tournament from watchlist"));
  },
};