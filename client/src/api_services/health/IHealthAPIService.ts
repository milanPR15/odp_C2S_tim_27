export type ApiResponse<T> = { success: boolean; message: string; data?: T };

export type HealthNode = {
  name: string;
  host: string;
  port: number;
  status: "healthy" | "degraded" | "unreachable";
  lastCheck?: string;
  successfulWrites: number;
  failedWrites: number;
};

export type BackendTargetHealth = {
  id: string;
  url: string;
  weight: number;
  activeConnections: number;
  healthy: boolean;
  lastProbeAt: string;
  lastProbeError: string;
};

export type LoadBalancerHealth = {
  strategy: string;
  lbPort: number;
  targets: BackendTargetHealth[];
};

export interface IHealthAPIService {
  getDbHealth(): Promise<ApiResponse<HealthNode[]>>;
  getBackendHealth(): Promise<ApiResponse<LoadBalancerHealth>>;
}
