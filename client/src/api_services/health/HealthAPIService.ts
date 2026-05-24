import axios from "axios";
import type { IHealthAPIService, HealthNode, ApiResponse } from "./IHealthAPIService";
import { authHeader, handleError } from "../ApiUtils";

const BASE = import.meta.env.VITE_API_URL + "health";

export const healthApi: IHealthAPIService = {
  async getDbHealth() {
    return axios
      .get<ApiResponse<HealthNode[]>>(`${BASE}/db`, { headers: authHeader() })
      .then((r) => r.data)
      .catch((e) => handleError<HealthNode[]>(e, "Failed to load DB health"));
  },
};
