import type { TeamDto, CreateTeamDto, UpdateTeamDto, TeamInvitationDto } from "../../models/team/TeamTypes";

export type ApiResponse<T> = { success: boolean; message: string; data?: T };

export interface ITeamsAPIService {
  getMyTeams(): Promise<ApiResponse<TeamDto[]>>;
  getTeamById(id: number): Promise<ApiResponse<TeamDto>>;
  createTeam(payload: CreateTeamDto): Promise<ApiResponse<TeamDto>>;
  updateTeam(id: number, payload: UpdateTeamDto): Promise<ApiResponse<TeamDto>>;
  deleteTeam(id: number): Promise<ApiResponse<void>>;
  
  transferCaptain(teamId: number, newCaptainId: number): Promise<ApiResponse<void>>;
  removeMember(teamId: number, userId: number): Promise<ApiResponse<void>>;
  
  // Invitations
  sendInvite(teamId: number, identifier: string): Promise<ApiResponse<void>>;
  respondToInvite(teamId: number, accept: boolean): Promise<ApiResponse<void>>;
  getMyInvitations(): Promise<ApiResponse<TeamInvitationDto[]>>;
  getTeamInvitations(teamId: number): Promise<ApiResponse<TeamInvitationDto[]>>;
  cancelInvite(inviteId: number): Promise<ApiResponse<void>>;
}