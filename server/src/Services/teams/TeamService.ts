import { ITeamService } from "../../Domain/services/teams/ITeamService";
import { ITeamRepository } from "../../Domain/repositories/teams/ITeamRepository";
import { TeamDto } from "../../Domain/DTOs/teams/TeamDto";
import { CreateTeamDto } from "../../Domain/DTOs/teams/CreateTeamDto";
import { Team } from "../../Domain/models/Team";
import { ILoggerService } from "../../Domain/services/logger/ILoggerService";
import { Result } from "../../Domain/types/Result";

export class TeamService implements ITeamService {

  public constructor(
    private readonly teamRepo: ITeamRepository,
    private readonly logger: ILoggerService
  ) {}

  async createTeam(userId: number, dto: CreateTeamDto): Promise<Result<TeamDto>> {
    if (!dto.isValid()) {
      return { success: false, error: "Invalid team data", statusCode: 400 };
    }

    const team = await this.teamRepo.create(dto, userId);
    if (!team.team_id) {
       return { success: false, error: "Failed to create team", statusCode: 500 };
    }

    return { 
      success: true, 
      data: new TeamDto(
        team.team_id,
        team.team_name,
        team.tag,
        team.logo,
        team.description,
        userId,                    
        "",                        
        1,                         
        team.createdAt
      )
    };
  }

  async getTeamById(teamId: number): Promise<Result<TeamDto>> {
    const team = await this.teamRepo.findById(teamId);
    if (!team) return { success: false, error: "Team not found", statusCode: 404 };

    // TODO: kasnije dodati captain_gamer_tag i members
    return { 
      success: true,
      data: new TeamDto(
        team.team_id,
        team.team_name,
        team.tag,
        team.logo,
        team.description,
        0, 
        "",
        0,
        team.createdAt
      )
    };
  }

  async getMyTeams(userId: number): Promise<Result<TeamDto[]>> {
    const teams = await this.teamRepo.findByUserId(userId);
    return {
      success: true,
      data: teams.map(team => new TeamDto(
        team.team_id,
        team.team_name,
        team.tag,
        team.logo,
        team.description,
        0,
        "",
        0,
        team.createdAt
      ))
    };
  }

  async updateTeam(teamId: number, userId: number, dto: Partial<CreateTeamDto>): Promise<Result<TeamDto>> {
    const members = await this.teamRepo.findMembers(teamId);
    const isCaptain = members.some(m => m.user_id === userId && m.role === 'captain');
    
    if (!isCaptain) {
      this.logger.warn("TeamService", `User ${userId} attempted to update team ${teamId} without captain rights.`);
      return { success: false, error: "Unauthorized. You are not the captain of this team.", statusCode: 403 };
    }

    const success = await this.teamRepo.update(teamId, dto as Partial<Team>);
    if (!success) return { success: false, error: "Failed to update team", statusCode: 400 };
    
    return this.getTeamById(teamId);
  }

  async deleteTeam(teamId: number, userId: number): Promise<Result<boolean>> {
    const members = await this.teamRepo.findMembers(teamId);
    const isCaptain = members.some(m => m.user_id === userId && m.role === 'captain');
    
    if (!isCaptain) {
      this.logger.warn("TeamService", `User ${userId} attempted to delete team ${teamId} without captain rights.`);
      return { success: false, error: "Unauthorized. You are not the captain of this team.", statusCode: 403 };
    }

    const success = await this.teamRepo.delete(teamId);
    if (!success) return { success: false, error: "Failed to delete team", statusCode: 400 };
    return { success: true, data: true };
  }

  async addMember(teamId: number, captainId: number, targetUserId: number): Promise<Result<boolean>> {
    const members = await this.teamRepo.findMembers(teamId);
    const isCaptain = members.some(m => m.user_id === captainId && m.role === 'captain');
    if (!isCaptain) {
      this.logger.warn("TeamService", `User ${captainId} attempted to add member to team ${teamId} without captain rights.`);
      return { success: false, error: "Unauthorized. You are not the captain of this team.", statusCode: 403 };
    }
    const success = await this.teamRepo.addMember(teamId, targetUserId, 'member');
    if (!success) return { success: false, error: "Failed to add member", statusCode: 400 };
    return { success: true, data: true };
  }

  async removeMember(teamId: number, requesterId: number, targetUserId: number): Promise<Result<boolean>> {
    const members = await this.teamRepo.findMembers(teamId);
    const isCaptain = members.some(m => m.user_id === requesterId && m.role === 'captain');
    const isSelfRemoval = requesterId === targetUserId;

    if (!isCaptain && !isSelfRemoval) {
      this.logger.warn("TeamService", `User ${requesterId} attempted to remove member ${targetUserId} from team ${teamId} without proper rights.`);
      return { success: false, error: "Unauthorized. You are not the captain of this team and cannot remove others.", statusCode: 403 };
    }

    const success = await this.teamRepo.removeMember(teamId, targetUserId);
    if (!success) return { success: false, error: "Failed to remove member", statusCode: 400 };
    return { success: true, data: true };
  }

  async transferCaptain(teamId: number, currentCaptainId: number, newCaptainId: number): Promise<Result<boolean>> {
    const members = await this.teamRepo.findMembers(teamId);
    const isCurrentCaptain = members.some(m => m.user_id === currentCaptainId && m.role === 'captain');

    if (!isCurrentCaptain) {
      this.logger.warn("TeamService", `User ${currentCaptainId} attempted to transfer captaincy of team ${teamId} without proper rights.`);
      return { success: false, error: "Unauthorized. You are not the captain of this team.", statusCode: 403 };
    }

    const success = await this.teamRepo.changeCaptain(teamId, newCaptainId);
    if (!success) return { success: false, error: "Failed to transfer captain", statusCode: 400 };
    return { success: true, data: true };
  }
}