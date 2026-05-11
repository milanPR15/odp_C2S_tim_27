import { ITeamService } from "../../Domain/services/teams/ITeamService";
import { ITeamRepository } from "../../Domain/repositories/teams/ITeamRepository";
import { TeamDto } from "../../Domain/DTOs/teams/TeamDto";
import { CreateTeamDto } from "../../Domain/DTOs/teams/CreateTeamDto";
import { Team } from "../../Domain/models/Team";
import { ILoggerService } from "../../Domain/services/logger/ILoggerService";

export class TeamService implements ITeamService {

  public constructor(
    private readonly teamRepo: ITeamRepository,
    private readonly logger: ILoggerService
  ) {}

  async createTeam(userId: number, dto: CreateTeamDto): Promise<TeamDto> {
    if (!dto.isValid()) {
      throw new Error("Invalid team data");
    }

    const team = await this.teamRepo.create(dto, userId);

    return new TeamDto(
      team.team_id,
      team.team_name,
      team.tag,
      team.logo,
      team.description,
      userId,                    
      "",                        
      1,                         
      team.createdAt
    );
  }

  async getTeamById(teamId: number): Promise<TeamDto | null> {
    const team = await this.teamRepo.findById(teamId);
    if (!team) return null;

    // TODO: kasnije dodati captain_gamer_tag i members
    return new TeamDto(
      team.team_id,
      team.team_name,
      team.tag,
      team.logo,
      team.description,
      0, 
      "",
      0,
      team.createdAt
    );
  }

  async getMyTeams(userId: number): Promise<TeamDto[]> {
    const teams = await this.teamRepo.findByUserId(userId);
    return teams.map(team => new TeamDto(
      team.team_id,
      team.team_name,
      team.tag,
      team.logo,
      team.description,
      0,
      "",
      0,
      team.createdAt
    ));
  }

  async updateTeam(teamId: number, userId: number, dto: Partial<CreateTeamDto>): Promise<TeamDto | null> {
    // TODO: Proveriti da li je korisnik captain
    const success = await this.teamRepo.update(teamId, dto as Partial<Team>);
    if (!success) return null;
    return this.getTeamById(teamId);
  }

  async deleteTeam(teamId: number, userId: number): Promise<boolean> {
    // TODO: Proveriti da li je korisnik captain
    return this.teamRepo.delete(teamId);
  }

  async addMember(teamId: number, captainId: number, targetUserId: number): Promise<boolean> {
    // TODO: Proveriti da li je captainId kapiten tima
    return this.teamRepo.addMember(teamId, targetUserId, 'member');
  }

  async removeMember(teamId: number, requesterId: number, targetUserId: number): Promise<boolean> {
    // TODO: Proveriti dozvole (requester moze biti captain ili sam targetUserId)
    return this.teamRepo.removeMember(teamId, targetUserId);
  }

  async transferCaptain(teamId: number, currentCaptainId: number, newCaptainId: number): Promise<boolean> {
    // TODO: Implementirati proveru da li je currentCaptainId stvarni kapiten tima
    return this.teamRepo.changeCaptain(teamId, newCaptainId);
  }
}