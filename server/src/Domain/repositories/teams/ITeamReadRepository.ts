import { Team } from "../../models/Team";
import { TeamMember } from "../../models/TeamMember";

export interface ITeamReadRepository {
  findById(teamId: number): Promise<Team>;
  findByUserId(userId: number): Promise<Team[]>;
  findMembers(teamId: number): Promise<TeamMember[]>;
  isUserInTeam(userId: number, teamId: number): Promise<boolean>;
  findByIds(teamIds: number[]): Promise<Team[]>;
  isUserCaptain(teamId: number, userId: number): Promise<boolean>;
}
