import { InvitationStatus } from "../enums/InvitationStatus";

export class TeamInvitation {
  constructor(
    public id: number = 0,
    public team_id: number = 0,
    public user_id: number = 0,
    public status: InvitationStatus = InvitationStatus.PENDING,
    public created_at: Date = new Date(),
    public updated_at: Date = new Date()
  ) {}
}
