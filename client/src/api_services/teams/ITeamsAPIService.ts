import type { TeamDto, CreateTeamDto, UpdateTeamDto } from "../../models/team/TeamTypes";

export type ApiResponse<T> = { success: boolean; message: string; data?: T };

export interface ITeamsAPIService {
  getMyTeams(): Promise<ApiResponse<TeamDto[]>>;
  getTeamById(id: number): Promise<ApiResponse<TeamDto>>;
  createTeam(payload: CreateTeamDto): Promise<ApiResponse<TeamDto>>;
  updateTeam(id: number, payload: UpdateTeamDto): Promise<ApiResponse<TeamDto>>;
  deleteTeam(id: number): Promise<ApiResponse<void>>;
  
  transferCaptain(teamId: number, newCaptainId: number): Promise<ApiResponse<void>>;
  removeMember(teamId: number, userId: number): Promise<ApiResponse<void>>;
  
  // Stubs for future endpoints handled by controller
  sendInvite(teamId: number): Promise<ApiResponse<void>>;
  respondToInvite(teamId: number): Promise<ApiResponse<void>>;
}