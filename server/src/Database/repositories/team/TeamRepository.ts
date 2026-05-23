import { ITeamRepository } from "../../../Domain/repositories/teams/ITeamRepository";
import { Team } from "../../../Domain/models/Team";
import { TeamMember } from "../../../Domain/models/TeamMember";
import { CreateTeamDto } from "../../../Domain/DTOs/teams/CreateTeamDto";
import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";
import { TeamReadRepository } from "./TeamReadRepository";
import { TeamWriteRepository } from "./TeamWriteRepository";

export class TeamRepository implements ITeamRepository {
  private readonly readRepo: TeamReadRepository;
  private readonly writeRepo: TeamWriteRepository;

  constructor(db: DbManager, logger: ILoggerService) {
    this.readRepo = new TeamReadRepository(db, logger);
    this.writeRepo = new TeamWriteRepository(db, logger);
  }

  async create(dto: CreateTeamDto, userId: number): Promise<Team> {
    return this.writeRepo.create(dto, userId);
  }

  async update(teamId: number, teamData: Partial<Team>): Promise<boolean> {
    return this.writeRepo.update(teamId, teamData);
  }

  async delete(teamId: number): Promise<boolean> {
    return this.writeRepo.delete(teamId);
  }

  async addMember(teamId: number, userId: number, role: 'captain' | 'member'): Promise<boolean> {
    return this.writeRepo.addMember(teamId, userId, role);
  }

  async removeMember(teamId: number, userId: number): Promise<boolean> {
    return this.writeRepo.removeMember(teamId, userId);
  }

  async changeCaptain(teamId: number, newCaptainId: number): Promise<boolean> {
    return this.writeRepo.changeCaptain(teamId, newCaptainId);
  }

  async findById(teamId: number): Promise<Team | null> {
    return this.readRepo.findById(teamId);
  }

  async findByUserId(userId: number): Promise<Team[]> {
    return this.readRepo.findByUserId(userId);
  }

  async findMembers(teamId: number): Promise<TeamMember[]> {
    return this.readRepo.findMembers(teamId);
  }

  async isUserInTeam(userId: number, teamId: number): Promise<boolean> {
    return this.readRepo.isUserInTeam(userId, teamId);
  }

  async getConfirmedTournamentTeams(tournamentId: number): Promise<Team[]> {
    return this.readRepo.getConfirmedTournamentTeams(tournamentId);
  }
}