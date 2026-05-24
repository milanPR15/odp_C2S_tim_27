export type ApiResponse<T> = { success: boolean; message: string; data?: T };

export type HealthNode = {
  name: string;
  host: string;
  port: number;
  status: "healthy" | "degraded" | "unreachable";
  lastCheck?: string | null;
  successfulWrites: number;
  failedWrites: number;
};

export interface IHealthAPIService {
  getDbHealth(): Promise<ApiResponse<HealthNode[]>>;
}
