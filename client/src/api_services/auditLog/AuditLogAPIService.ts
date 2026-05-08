import axios from "axios";
import type { ApiResponse, IAuditLogAPIService } from "./IAuditLogAPIService";
import type { AuditLogDto } from "../../models/auditLog/AuditLogTypes";
import { readItem } from "../../helpers/local_storage";

const BASE = import.meta.env.VITE_API_URL + "audit-logs";

const authHeader = () => {
  const token = readItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const err = <T>(e: unknown, fallback: string): ApiResponse<T> => ({
  success: false,
  message: axios.isAxiosError(e) ? (e.response?.data as { message?: string })?.message ?? fallback : fallback,
});

export const auditLogApi: IAuditLogAPIService = {
  async getAll() {
    return axios.get<ApiResponse<AuditLogDto[]>>(BASE, { headers: authHeader() })
      .then((r) => r.data).catch((e) => err(e, "Failed to load audit logs"));
  }
};