import { TeamInvitation } from "../../models/TeamInvitation";
import { InvitationStatus } from '../../enums/InvitationStatus';

export interface ITeamInvitationReadRepository {
  findById(id: number): Promise<TeamInvitation>;
  findByTeamAndUser(teamId: number, userId: number): Promise<TeamInvitation>;
  findByUserId(userId: number): Promise<TeamInvitation[]>;
  findByTeamId(teamId: number): Promise<TeamInvitation[]>;
}
