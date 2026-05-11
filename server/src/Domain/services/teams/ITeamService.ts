import { TeamDto } from "../../DTOs/teams/TeamDto";
import { CreateTeamDto } from "../../DTOs/teams/CreateTeamDto";
import { Result } from "../../types/Result";

export interface ITeamService {
  createTeam(userId: number, dto: CreateTeamDto): Promise<Result<TeamDto>>;
  getTeamById(teamId: number): Promise<Result<TeamDto>>;
  getMyTeams(userId: number): Promise<Result<TeamDto[]>>;
  updateTeam(teamId: number, userId: number, dto: Partial<CreateTeamDto>): Promise<Result<TeamDto>>;
  deleteTeam(teamId: number, userId: number): Promise<Result<boolean>>;

  addMember(teamId: number, captainId: number, targetUserId: number): Promise<Result<boolean>>;
  removeMember(teamId: number, requesterId: number, targetUserId: number): Promise<Result<boolean>>;
  transferCaptain(teamId: number, currentCaptainId: number, newCaptainId: number): Promise<Result<boolean>>;
}