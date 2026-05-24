import { TeamInvitation } from "../../models/TeamInvitation";
import { InvitationStatus } from '../../enums/InvitationStatus';

export interface ITeamInvitationReadRepository {
  findById(id: number): Promise<TeamInvitation | null>;
  findByTeamAndUser(teamId: number, userId: number): Promise<TeamInvitation | null>;
  findByUserId(userId: number): Promise<TeamInvitation[]>;
  findByTeamId(teamId: number): Promise<TeamInvitation[]>;
}
