import { ITeamService } from "../../Domain/services/teams/ITeamService";
import { ITeamReadRepository } from "../../Domain/repositories/teams/ITeamReadRepository";
import { ITeamWriteRepository } from "../../Domain/repositories/teams/ITeamWriteRepository";
import { ITeamInvitationReadRepository } from "../../Domain/repositories/team_invitations/ITeamInvitationReadRepository";
import { ITeamInvitationWriteRepository } from "../../Domain/repositories/team_invitations/ITeamInvitationWriteRepository";
import { IUserReadRepository } from "../../Domain/repositories/users/IUserReadRepository";
import { TeamDto } from "../../Domain/DTOs/teams/TeamDto";
import { CreateTeamDto } from "../../Domain/DTOs/teams/CreateTeamDto";
import { Team } from "../../Domain/models/Team";
import { TeamInvitation } from "../../Domain/models/TeamInvitation";
import { InvitationStatus } from "../../Domain/enums/InvitationStatus";
import { ILoggerService } from "../../Domain/services/logger/ILoggerService";
import { Result } from "../../Domain/types/Result";
import { UserRole } from "../../Domain/enums/UserRole";
import { TeamRole } from "../../Domain/enums/TeamRole";

export class TeamService implements ITeamService {

  public constructor(
    private readonly teamReadRepo: ITeamReadRepository,
    private readonly teamWriteRepo: ITeamWriteRepository,
    private readonly invitationReadRepo: ITeamInvitationReadRepository,
    private readonly invitationWriteRepo: ITeamInvitationWriteRepository,
    private readonly userReadRepo: IUserReadRepository,
    private readonly logger: ILoggerService
  ) {}

  async createTeam(userId: number, dto: CreateTeamDto): Promise<Result<TeamDto>> {
    if (!dto.isValid()) {
      return { success: false, error: "Invalid team data", statusCode: 400 };
    }

    const team = await this.teamWriteRepo.create(dto, userId);
    if (!team.team_id) {
       return { success: false, error: "Failed to create team", statusCode: 500 };
    }

    const user = await this.userReadRepo.findById(userId);

    return { 
      success: true, 
      data: new TeamDto(
        team.team_id,
        team.team_name,
        team.tag,
        team.logo,
        team.description,
        userId,                    
        user.gamer_tag,                        
        1,                         
        team.createdAt,
        [{
          user_id: user.id,
          gamer_tag: user.gamer_tag,
          full_name: user.full_name,
          role: TeamRole.CAPTAIN,
          joined_at: new Date()
        }]
      )
    };
  }

  private async toTeamDto(team: Team): Promise<TeamDto> {
    const members = await this.teamReadRepo.findMembers(team.team_id);
    const captain = members.find(m => m.role === TeamRole.CAPTAIN);
    
    let captainTag = "";
    if (captain) {
        const user = await this.userReadRepo.findById(captain.user_id);
        if (user) captainTag = user.gamer_tag;
    }

    const memberDtos = await Promise.all(members.map(async m => {
      const u = await this.userReadRepo.findById(m.user_id);
      return {
        user_id: m.user_id,
        gamer_tag: u ? u.gamer_tag : "",
        full_name: u ? u.full_name : "",
        role: m.role,
        joined_at: m.joined_at
      };
    }));

    return new TeamDto(
        team.team_id,
        team.team_name,
        team.tag,
        team.logo,
        team.description,
        captain ? captain.user_id : 0, 
        captainTag,
        members.length,
        team.createdAt,
        memberDtos
    );
  }

  async getTeamById(teamId: number): Promise<Result<TeamDto>> {
    const team = await this.teamReadRepo.findById(teamId);
    if (!team) return { success: false, error: "Team not found", statusCode: 404 };

    const dto = await this.toTeamDto(team);
    return { 
      success: true,
      data: dto
    };
  }

  async getMyTeams(userId: number): Promise<Result<TeamDto[]>> {
    const teams = await this.teamReadRepo.findByUserId(userId);
    const dtos = await Promise.all(teams.map(team => this.toTeamDto(team)));
    return {
      success: true,
      data: dtos
    };
  }

  async updateTeam(teamId: number, userId: number, dto: Partial<CreateTeamDto>): Promise<Result<TeamDto>> {
    const members = await this.teamReadRepo.findMembers(teamId);
    const isCaptain = members.some(m => m.user_id === userId && m.role === TeamRole.CAPTAIN);
    
    if (!isCaptain) {
      this.logger.warn("TeamService", `User ${userId} attempted to update team ${teamId} without captain rights.`);
      return { success: false, error: "Unauthorized. You are not the captain of this team.", statusCode: 403 };
    }

    const success = await this.teamWriteRepo.update(teamId, dto as Partial<Team>);
    if (!success) return { success: false, error: "Failed to update team", statusCode: 400 };
    
    return this.getTeamById(teamId);
  }

  async deleteTeam(teamId: number, userId: number): Promise<Result<boolean>> {
    const members = await this.teamReadRepo.findMembers(teamId);
    const isCaptain = members.some(m => m.user_id === userId && m.role === TeamRole.CAPTAIN);
    
    if (!isCaptain) {
      this.logger.warn("TeamService", `User ${userId} attempted to delete team ${teamId} without captain rights.`);
      return { success: false, error: "Unauthorized. You are not the captain of this team.", statusCode: 403 };
    }

    const success = await this.teamWriteRepo.delete(teamId);
    if (!success) return { success: false, error: "Failed to delete team", statusCode: 400 };
    return { success: true, data: true };
  }

  async addMember(teamId: number, captainId: number, targetUserId: number): Promise<Result<boolean>> {
    const members = await this.teamReadRepo.findMembers(teamId);
    const isCaptain = members.some(m => m.user_id === captainId && m.role === TeamRole.CAPTAIN);
    if (!isCaptain) {
      this.logger.warn("TeamService", `User ${captainId} attempted to add member to team ${teamId} without captain rights.`);
      return { success: false, error: "Unauthorized. You are not the captain of this team.", statusCode: 403 };
    }
    const success = await this.teamWriteRepo.addMember(teamId, targetUserId, TeamRole.MEMBER);
    if (!success) return { success: false, error: "Failed to add member", statusCode: 400 };
    return { success: true, data: true };
  }

  async removeMember(teamId: number, requesterId: number, targetUserId: number): Promise<Result<boolean>> {
    const members = await this.teamReadRepo.findMembers(teamId);
    const isCaptain = members.some(m => m.user_id === requesterId && m.role === TeamRole.CAPTAIN);
    const isSelfRemoval = requesterId === targetUserId;

    if (!isCaptain && !isSelfRemoval) {
      this.logger.warn("TeamService", `User ${requesterId} attempted to remove member ${targetUserId} from team ${teamId} without proper rights.`);
      return { success: false, error: "Unauthorized. You are not the captain of this team and cannot remove others.", statusCode: 403 };
    }

    const success = await this.teamWriteRepo.removeMember(teamId, targetUserId);
    if (!success) return { success: false, error: "Failed to remove member", statusCode: 400 };
    return { success: true, data: true };
  }

  async transferCaptain(teamId: number, currentCaptainId: number, newCaptainId: number): Promise<Result<boolean>> {
    const members = await this.teamReadRepo.findMembers(teamId);
    const isCurrentCaptain = members.some(m => m.user_id === currentCaptainId && m.role === TeamRole.CAPTAIN);

    if (!isCurrentCaptain) {
      this.logger.warn("TeamService", `User ${currentCaptainId} attempted to transfer captaincy of team ${teamId} without proper rights.`);
      return { success: false, error: "Unauthorized. You are not the captain of this team.", statusCode: 403 };
    }

    const success = await this.teamWriteRepo.changeCaptain(teamId, newCaptainId);
    if (!success) return { success: false, error: "Failed to transfer captain", statusCode: 400 };
    return { success: true, data: true };
  }

  async sendInvite(teamId: number, captainId: number, username: string): Promise<Result<boolean>> {
    // 1. Find user
    const targetUser = await this.userReadRepo.findByUsername(username);
    if (!targetUser.id) {
       return { success: false, error: "User not found", statusCode: 404 };
    }
    const targetUserId = targetUser.id;

    // 2. Verify captain
    const members = await this.teamReadRepo.findMembers(teamId);
    if (members.length === 0) {
      return { success: false, error: "Team not found", statusCode: 404 };
    }

    const isCaptain = members.some((m) => m.user_id === captainId && m.role === TeamRole.CAPTAIN);
    if (!isCaptain) {
      return { success: false, error: "Only team captain can invite members", statusCode: 403 };
    }

    // 3. Check if already in the team
    const inTeam = members.some((m) => m.user_id === targetUserId);
    if (inTeam) {
      return { success: false, error: "User is already in the team", statusCode: 400 };
    }

    // 4. Check for pending invites
    const existingInvite = await this.invitationReadRepo.findByTeamAndUser(teamId, targetUserId);
    if (existingInvite && existingInvite.status === InvitationStatus.PENDING) {
      return { success: false, error: "An invitation is already pending for this user", statusCode: 400 };
    }

    // 5. Create invite
    const invite = await this.invitationWriteRepo.create(teamId, targetUserId);
    if (!invite.id) {
       return { success: false, error: "Failed to send invitation", statusCode: 500 };
    }

    return { success: true, data: true };
  }

  async respondToInvite(teamId: number, userId: number, accept: boolean): Promise<Result<boolean>> {
    // 1. Get invite by team and user
    const invite = await this.invitationReadRepo.findByTeamAndUser(teamId, userId);
    if (!invite) {
      return { success: false, error: "Pending invitation not found", statusCode: 404 };
    }

    if (invite.status !== InvitationStatus.PENDING) {
      return { success: false, error: "Invitation is no longer pending", statusCode: 400 };
    }

    // 2. Update status and conditionally add to team
    const newStatus = accept ? InvitationStatus.ACCEPTED : InvitationStatus.DECLINED;
    const updated = await this.invitationWriteRepo.updateStatus(invite.id, newStatus);

    if (!updated) {
      return { success: false, error: "Failed to update invitation status", statusCode: 500 };
    }

    if (accept) {
      const added = await this.teamWriteRepo.addMember(invite.team_id, userId, TeamRole.MEMBER);
      if (!added) {
        return { success: false, error: "Failed to add member to team", statusCode: 500 };
      }
    }

    return { success: true, data: true };
  }

  async getMyInvitations(userId: number): Promise<Result<TeamInvitation[]>> {
    const invitations = await this.invitationReadRepo.findByUserId(userId);
    return { success: true, data: invitations };
  }

  async getTeamInvitations(teamId: number, captainId: number): Promise<Result<TeamInvitation[]>> {
    const members = await this.teamReadRepo.findMembers(teamId);
    if (members.length === 0) return { success: false, error: "Team not found", statusCode: 404 };

    const isCaptain = members.some((m) => m.user_id === captainId && m.role === TeamRole.CAPTAIN);
    if (!isCaptain) {
      this.logger.warn("TeamService", `User ${captainId} attempted to get invitations for team ${teamId} without captain rights.`);
      return { success: false, error: "Only team captain can view team invitations", statusCode: 403 };
    }

    const invitations = await this.invitationReadRepo.findByTeamId(teamId);
    return { success: true, data: invitations };
  }

  async cancelInvite(inviteId: number, captainId: number): Promise<Result<boolean>> {
    const invite = await this.invitationReadRepo.findById(inviteId);
    if (!invite) return { success: false, error: "Invitation not found", statusCode: 404 };

    const members = await this.teamReadRepo.findMembers(invite.team_id);
    const isCaptain = members.some((m) => m.user_id === captainId && m.role === TeamRole.CAPTAIN);
    
    if (!isCaptain) {
      this.logger.warn("TeamService", `User ${captainId} attempted to cancel invitation ${inviteId} without captain rights.`);
      return { success: false, error: "Only team captain can cancel invitations", statusCode: 403 };
    }

    const updated = await this.invitationWriteRepo.updateStatus(inviteId, InvitationStatus.DECLINED);
    if (!updated) return { success: false, error: "Failed to cancel invitation", statusCode: 500 };

    return { success: true, data: true };
  }
}