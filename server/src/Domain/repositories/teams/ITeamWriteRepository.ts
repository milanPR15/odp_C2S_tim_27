import { Team } from "../../models/Team";
import { TeamMember } from "../../models/TeamMember";
import { CreateTeamDto } from "../../DTOs/teams/CreateTeamDto";

export interface ITeamWriteRepository {
  create(team: CreateTeamDto, userId: number): Promise<Team>;
  update(teamId: number, team: Partial<Team>): Promise<boolean>;
  delete(teamId: number): Promise<boolean>;
  addMember(teamId: number, userId: number, role: 'captain' | 'member'): Promise<boolean>;
  removeMember(teamId: number, userId: number): Promise<boolean>;
  changeCaptain(teamId: number, newCaptainId: number): Promise<boolean>;
 }
