import axios from "axios";
import type { IUsersAPIService, ApiResponse } from "./IUsersAPIService";
import type { UserDto } from "../../models/user/UserTypes";
import { authHeader, handleError } from "../ApiUtils";

const BASE = import.meta.env.VITE_API_URL + "users";

export const usersApi: IUsersAPIService = {
  async getAll() {
    return axios.get<ApiResponse<UserDto[]>>(BASE, { headers: authHeader() })
      .then(r => r.data).catch(e => handleError(e, "Failed to load users"));
  },
  async getById(id) {
    return axios.get<ApiResponse<UserDto>>(`${BASE}/${id}`, { headers: authHeader() })
      .then(r => r.data).catch(e => handleError(e, "Failed to load user"));
  },
  async deactivate(id) {
    return axios.patch<ApiResponse<void>>(`${BASE}/${id}/deactivate`, {}, { headers: authHeader() })
      .then(r => r.data).catch(e => handleError(e, "Failed to deactivate user"));
  },
};
