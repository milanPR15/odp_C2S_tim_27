import { ITeamInvitationRepository } from "../../../Domain/repositories/team_invitations/ITeamInvitationRepository";
import { TeamInvitation } from "../../../Domain/models/TeamInvitation";
import { InvitationStatus } from "../../../Domain/enums/InvitationStatus";
import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";
import { TeamInvitationReadRepository } from "./TeamInvitationReadRepository";
import { TeamInvitationWriteRepository } from "./TeamInvitationWriteRepository";

export class TeamInvitationRepository implements ITeamInvitationRepository {
  private readonly readRepo: TeamInvitationReadRepository;
  private readonly writeRepo: TeamInvitationWriteRepository;

  constructor(db: DbManager, logger: ILoggerService) {
    this.readRepo = new TeamInvitationReadRepository(db, logger);
    this.writeRepo = new TeamInvitationWriteRepository(db, logger);
  }

  async create(teamId: number, userId: number): Promise<TeamInvitation> {
    return this.writeRepo.create(teamId, userId);
  }

  async findById(id: number): Promise<TeamInvitation | null> {
    return this.readRepo.findById(id);
  }

  async findByTeamAndUser(teamId: number, userId: number): Promise<TeamInvitation | null> {
    return this.readRepo.findByTeamAndUser(teamId, userId);
  }

  async updateStatus(id: number, status: InvitationStatus): Promise<boolean> {
    return this.writeRepo.updateStatus(id, status);
  }

  async findByUserId(userId: number): Promise<TeamInvitation[]> {
    return this.readRepo.findByUserId(userId);
  }

  async findByTeamId(teamId: number): Promise<TeamInvitation[]> {
    return this.readRepo.findByTeamId(teamId);
  }

  async deleteById(id: number): Promise<boolean> {
    return this.writeRepo.deleteById(id);
  }
}