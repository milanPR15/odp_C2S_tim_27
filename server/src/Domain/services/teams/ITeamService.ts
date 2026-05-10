import { TeamDto } from "../../DTOs/teams/TeamDto";
import { CreateTeamDto } from "../../DTOs/teams/CreateTeamDto";

export interface ITeamService {
  createTeam(userId: number, dto: CreateTeamDto): Promise<TeamDto>;
  getTeamById(teamId: number): Promise<TeamDto | null>;
  getMyTeams(userId: number): Promise<TeamDto[]>;
  updateTeam(teamId: number, userId: number, dto: Partial<CreateTeamDto>): Promise<TeamDto | null>;
  deleteTeam(teamId: number, userId: number): Promise<boolean>;

  addMember(teamId: number, captainId: number, targetUserId: number): Promise<boolean>;
  removeMember(teamId: number, requesterId: number, targetUserId: number): Promise<boolean>;
  transferCaptain(teamId: number, currentCaptainId: number, newCaptainId: number): Promise<boolean>;
}