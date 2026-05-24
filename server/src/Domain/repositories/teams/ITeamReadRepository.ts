import { Team } from "../../models/Team";
import { TeamMember } from "../../models/TeamMember";
import { CreateTeamDto } from "../../DTOs/teams/CreateTeamDto";

export interface ITeamReadRepository {
  findById(teamId: number): Promise<Team | null>;
  findByUserId(userId: number): Promise<Team[]>;
  findMembers(teamId: number): Promise<TeamMember[]>;
  isUserInTeam(userId: number, teamId: number): Promise<boolean>;
  getConfirmedTournamentTeams(tournamentId: number): Promise<Team[]>
  getRegisteredTournamentTeams(tournamentId: number): Promise<Team[]>;
}
