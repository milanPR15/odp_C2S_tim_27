import { TeamInvitation } from "../../models/TeamInvitation";
import { InvitationStatus } from '../../enums/InvitationStatus';

export interface ITeamInvitationWriteRepository {
  create(teamId: number, userId: number): Promise<TeamInvitation>;
  updateStatus(id: number, status: InvitationStatus): Promise<boolean>;
  deleteById(id: number): Promise<boolean>;
}
