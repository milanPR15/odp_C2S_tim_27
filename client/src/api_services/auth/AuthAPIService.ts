import axios from "axios";
import type { AuthResponse } from "../../types/auth/AuthResponse";
import type { IAuthAPIService } from "./IAuthAPIService";
import { handleError } from "../ApiUtils";

const BASE = import.meta.env.VITE_API_URL + "auth";

export const authApi: IAuthAPIService = {
  async login(username, password) {
    return axios.post<AuthResponse>(`${BASE}/login`, { username, password })
      .then(r => r.data).catch(e => handleError<AuthResponse["data"]>(e, "Login failed"));
  },
  async register(username, fullname, email, password, role) {
    return axios.post<AuthResponse>(`${BASE}/register`, { username, fullname, email, password, role })
      .then(r => r.data).catch(e => handleError<AuthResponse["data"]>(e, "Registration failed"));
  },
};
