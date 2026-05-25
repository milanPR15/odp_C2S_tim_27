import axios from "axios";
import type { IHealthAPIService, HealthNode, ApiResponse, LoadBalancerHealth, BackendTargetHealth } from "./IHealthAPIService";
import { authHeader, handleError } from "../ApiUtils";

const BASE = import.meta.env.VITE_API_URL + "health";
const API_BASE_URL = import.meta.env.VITE_API_URL;
const LB_STATUS_URL = new URL("/__lb/status", API_BASE_URL).toString();
const API_ORIGIN = new URL(API_BASE_URL).origin;
const SINGLE_NODE_URL = new URL("health/check", API_BASE_URL).toString();

function getPortFromApiBase(): number {
  const parsed = new URL(API_BASE_URL);
  if (parsed.port) {
    return Number.parseInt(parsed.port, 10);
  }

  return parsed.protocol === "https:" ? 443 : 80;
}

function createSingleNodeTarget(): BackendTargetHealth {
  return {
    id: "api1",
    url: API_ORIGIN,
    weight: 1,
    activeConnections: 0,
    healthy: true,
    lastProbeAt: new Date().toISOString(),
    lastProbeError: "",
  };
}

export const healthApi: IHealthAPIService = {
  async getDbHealth() {
    return axios
      .get<ApiResponse<HealthNode[]>>(`${BASE}/db`, { headers: authHeader() })
      .then((r) => r.data)
      .catch((e) => handleError<HealthNode[]>(e, "Failed to load DB health"));
  },

  async getBackendHealth() {
    try {
      const response = await axios.get<LoadBalancerHealth>(LB_STATUS_URL);
      return { success: true, message: "", data: response.data };
    } catch {
      try {
        await axios.get(SINGLE_NODE_URL);
        return {
          success: true,
          message: "",
          data: {
            strategy: "single-node",
            lbPort: getPortFromApiBase(),
            targets: [createSingleNodeTarget()],
          },
        };
      } catch (e) {
        return handleError<LoadBalancerHealth>(e as Parameters<typeof handleError<LoadBalancerHealth>>[0], "Failed to load backend health");
      }
    }
  },
};
