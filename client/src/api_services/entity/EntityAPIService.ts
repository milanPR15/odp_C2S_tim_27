// TODO: Update BASE path to match your actual API route (e.g. "orders", "products", etc.)
import axios from "axios";
import type { IEntityAPIService, ApiResponse } from "./IEntityAPIService";
import type { EntityDto } from "../../models/entity/EntityDto";
import { authHeader, handleError } from "../ApiUtils";

const BASE = import.meta.env.VITE_API_URL + "entities";

export const entityApi: IEntityAPIService = {
  async getAll(page = 1, limit = 20) {
    return axios.get(`${BASE}?page=${page}&limit=${limit}`, { headers: authHeader() })
      .then(r => r.data).catch(e => handleError(e, "Failed to load items"));
  },
  async getById(id) {
    return axios.get<ApiResponse<EntityDto>>(`${BASE}/${id}`, { headers: authHeader() })
      .then(r => r.data).catch(e => handleError(e, "Failed to load item"));
  },
  async getByUserId(userId) {
    return axios.get<ApiResponse<EntityDto[]>>(`${BASE}/user/${userId}`, { headers: authHeader() })
      .then(r => r.data).catch(e => handleError(e, "Failed to load items"));
  },
  async create(payload) {
    return axios.post<ApiResponse<EntityDto>>(BASE, payload, { headers: authHeader() })
      .then(r => r.data).catch(e => handleError(e, "Failed to create"));
  },
  async update(id, payload) {
    return axios.patch<ApiResponse<void>>(`${BASE}/${id}`, payload, { headers: authHeader() })
      .then(r => r.data).catch(e => handleError(e, "Failed to update"));
  },
  async delete(id) {
    return axios.delete<ApiResponse<void>>(`${BASE}/${id}`, { headers: authHeader() })
      .then(r => r.data).catch(e => handleError(e, "Failed to delete"));
  },
};
