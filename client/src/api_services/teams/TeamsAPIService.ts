import axios from "axios";
import type { ApiResponse, ITeamsAPIService } from "./ITeamsAPIService";
import type { CreateTeamDto, TeamDto, UpdateTeamDto, TeamInvitationDto } from "../../models/team/TeamTypes";
import { authHeader, handleError } from "../ApiUtils";

const BASE = import.meta.env.VITE_API_URL + "teams";

export const teamsApi: ITeamsAPIService = {
  async getMyTeams() {
    return axios.get<ApiResponse<TeamDto[]>>(BASE, { headers: authHeader() })
      .then((r) => r.data).catch((e) => handleError(e, e.response?.data?.message ?? "Failed to load your teams"));
  },
  
  async getTeamById(id: number) {
    return axios.get<ApiResponse<TeamDto>>(`${BASE}/${id}`, { headers: authHeader() })
      .then((r) => r.data).catch((e) => handleError(e, e.response?.data?.message ?? "Failed to load team"));
  },

  async createTeam(payload: CreateTeamDto) {
    return axios.post<ApiResponse<TeamDto>>(BASE, payload, { headers: authHeader() })
      .then((r) => r.data).catch((e) => handleError(e, e.response?.data?.message ?? "Failed to create team"));
  },

  async updateTeam(id: number, payload: UpdateTeamDto) {
    return axios.put<ApiResponse<TeamDto>>(`${BASE}/${id}`, payload, { headers: authHeader() })
      .then((r) => r.data).catch((e) => handleError(e, e.response?.data?.message ?? "Failed to update team"));
  },

  async deleteTeam(id: number) {
    return axios.delete<ApiResponse<void>>(`${BASE}/${id}`, { headers: authHeader() })
      .then((r) => r.data).catch((e) => handleError(e, e.response?.data?.message ?? "Failed to delete team"));
  },

  async transferCaptain(teamId: number, newCaptainId: number) {
    return axios.patch<ApiResponse<void>>(`${BASE}/${teamId}/members/${newCaptainId}/role`, {}, { headers: authHeader() })
      .then((r) => r.data).catch((e) => handleError(e, e.response?.data?.message ?? "Failed to transfer captain role"));
  },

  async removeMember(teamId: number, userId: number) {
    return axios.delete<ApiResponse<void>>(`${BASE}/${teamId}/members/${userId}`, { headers: authHeader() })
      .then((r) => r.data).catch((e) => handleError(e, e.response?.data?.message ?? "Failed to remove member"));
  },

  async sendInvite(teamId: number, identifier: string) {
    return axios.post<ApiResponse<void>>(`${BASE}/${teamId}/invite`, { identifier }, { headers: authHeader() })
      .then((r) => r.data).catch((e) => handleError(e, e.response?.data?.message ?? "Failed to send invite"));
  },

  async respondToInvite(teamId: number, accept: boolean) {
    return axios.post<ApiResponse<void>>(`${BASE}/${teamId}/invite/respond`, { accept }, { headers: authHeader() })
      .then((r) => r.data).catch((e) => handleError(e, e.response?.data?.message ?? "Failed to respond to invite"));
  },

  async getMyInvitations() {
    return axios.get<ApiResponse<TeamInvitationDto[]>>(`${BASE}/invitations/me`, { headers: authHeader() })
      .then((r) => r.data).catch((e) => handleError(e, e.response?.data?.message ?? "Failed to load your invitations"));
  },

  async getTeamInvitations(teamId: number) {
    return axios.get<ApiResponse<TeamInvitationDto[]>>(`${BASE}/${teamId}/invitations`, { headers: authHeader() })
      .then((r) => r.data).catch((e) => handleError(e, e.response?.data?.message ?? "Failed to load team invitations"));
  },

  async cancelInvite(inviteId: number) {
    return axios.delete<ApiResponse<void>>(`${BASE}/invitations/${inviteId}`, { headers: authHeader() })
      .then((r) => r.data).catch((e) => handleError(e, e.response?.data?.message ?? "Failed to cancel invite"));
  }
};