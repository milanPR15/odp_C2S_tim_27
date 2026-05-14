import { TeamInvitation } from "../../models/TeamInvitation";
import { InvitationStatus } from '../../enums/InvitationStatus';

export interface ITeamInvitationRepository {
  create(teamId: number, userId: number): Promise<TeamInvitation>;
  findById(id: number): Promise<TeamInvitation | null>;
  findByTeamAndUser(teamId: number, userId: number): Promise<TeamInvitation | null>;
  findByUserId(userId: number): Promise<TeamInvitation[]>;
  findByTeamId(teamId: number): Promise<TeamInvitation[]>;
  updateStatus(id: number, status: InvitationStatus): Promise<boolean>;
  deleteById(id: number): Promise<boolean>;
}
