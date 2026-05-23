import axios from "axios";
import type { ApiResponse, IAuditLogAPIService } from "./IAuditLogAPIService";
import type { AuditLogDto } from "../../models/auditLog/AuditLogTypes";
import { authHeader, handleError } from "../ApiUtils";

const BASE = import.meta.env.VITE_API_URL + "audit-logs";

export const auditLogApi: IAuditLogAPIService = {
  async getAll() {
    return axios.get<ApiResponse<AuditLogDto[]>>(BASE, { headers: authHeader() })
      .then((r) => r.data).catch((e) => handleError(e, "Failed to load audit logs"));
  }
};