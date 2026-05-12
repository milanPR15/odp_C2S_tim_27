import { ITeamService } from "../../Domain/services/teams/ITeamService";
import { ITeamRepository } from "../../Domain/repositories/teams/ITeamRepository";
import { ITeamInvitationRepository } from "../../Domain/repositories/team_invitations/ITeamInvitationRepository";
import { TeamDto } from "../../Domain/DTOs/teams/TeamDto";
import { CreateTeamDto } from "../../Domain/DTOs/teams/CreateTeamDto";
import { Team } from "../../Domain/models/Team";
import { TeamInvitation } from "../../Domain/models/TeamInvitation";
import { InvitationStatus } from "../../Domain/enums/InvitationStatus";
import { ILoggerService } from "../../Domain/services/logger/ILoggerService";
import { Result } from "../../Domain/types/Result";

export class TeamService implements ITeamService {

  public constructor(
    private readonly teamRepo: ITeamRepository,
    private readonly invitationRepo: ITeamInvitationRepository,
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

  async sendInvite(teamId: number, captainId: number, targetUserId: number): Promise<Result<boolean>> {
    // 1. Verify captain
    const members = await this.teamRepo.findMembers(teamId);
    if (members.length === 0) {
      return { success: false, error: "Team not found", statusCode: 404 };
    }

    const isCaptain = members.some((m) => m.user_id === captainId && m.role === 'captain');
    if (!isCaptain) {
      return { success: false, error: "Only team captain can invite members", statusCode: 403 };
    }

    // 2. Check if already in the team
    const inTeam = members.some((m) => m.user_id === targetUserId);
    if (inTeam) {
      return { success: false, error: "User is already in the team", statusCode: 400 };
    }

    // 3. Check for pending invites
    const existingInvite = await this.invitationRepo.findByTeamAndUser(teamId, targetUserId);
    if (existingInvite && existingInvite.status === InvitationStatus.PENDING) {
      return { success: false, error: "An invitation is already pending for this user", statusCode: 400 };
    }

    // 4. Create invite
    const invite = await this.invitationRepo.create(teamId, targetUserId);
    if (!invite.id) {
       return { success: false, error: "Failed to send invitation", statusCode: 500 };
    }

    return { success: true, data: true };
  }

  async respondToInvite(teamId: number, userId: number, accept: boolean): Promise<Result<boolean>> {
    // 1. Get invite by team and user
    const invite = await this.invitationRepo.findByTeamAndUser(teamId, userId);
    if (!invite) {
      return { success: false, error: "Pending invitation not found", statusCode: 404 };
    }

    if (invite.status !== InvitationStatus.PENDING) {
      return { success: false, error: "Invitation is no longer pending", statusCode: 400 };
    }

    // 2. Update status and conditionally add to team
    const newStatus = accept ? InvitationStatus.ACCEPTED : InvitationStatus.DECLINED;
    const updated = await this.invitationRepo.updateStatus(invite.id, newStatus);

    if (!updated) {
      return { success: false, error: "Failed to update invitation status", statusCode: 500 };
    }

    if (accept) {
      const added = await this.teamRepo.addMember(invite.team_id, userId, 'member');
      if (!added) {
        return { success: false, error: "Failed to add member to team", statusCode: 500 };
      }
    }

    return { success: true, data: true };
  }

  async getMyInvitations(userId: number): Promise<Result<TeamInvitation[]>> {
    const invitations = await this.invitationRepo.findByUserId(userId);
    return { success: true, data: invitations };
  }

  async getTeamInvitations(teamId: number, captainId: number): Promise<Result<TeamInvitation[]>> {
    const members = await this.teamRepo.findMembers(teamId);
    if (members.length === 0) return { success: false, error: "Team not found", statusCode: 404 };

    const isCaptain = members.some((m) => m.user_id === captainId && m.role === 'captain');
    if (!isCaptain) {
      this.logger.warn("TeamService", `User ${captainId} attempted to get invitations for team ${teamId} without captain rights.`);
      return { success: false, error: "Only team captain can view team invitations", statusCode: 403 };
    }

    const invitations = await this.invitationRepo.findByTeamId(teamId);
    return { success: true, data: invitations };
  }

  async cancelInvite(inviteId: number, captainId: number): Promise<Result<boolean>> {
    const invite = await this.invitationRepo.findById(inviteId);
    if (!invite) return { success: false, error: "Invitation not found", statusCode: 404 };

    const members = await this.teamRepo.findMembers(invite.team_id);
    const isCaptain = members.some((m) => m.user_id === captainId && m.role === 'captain');
    
    if (!isCaptain) {
      this.logger.warn("TeamService", `User ${captainId} attempted to cancel invitation ${inviteId} without captain rights.`);
      return { success: false, error: "Only team captain can cancel invitations", statusCode: 403 };
    }

    const updated = await this.invitationRepo.updateStatus(inviteId, InvitationStatus.DECLINED);
    if (!updated) return { success: false, error: "Failed to cancel invitation", statusCode: 500 };

    return { success: true, data: true };
  }
}