import { Team } from "../../models/Team";
import { User} from "../../models/User";

export interface ITeamRepository{
    create(team: Omit<Team, 'team_id' | 'createdAt' | 'updateAt'>): Promise<Team>;
    update(id: number, teamData: Partial<Team>): Promise<boolean>;
    findById(id: number): Promise<Team | null>;
    findByTag(tag: string): Promise<Team | null>;
    delete(id: number): Promise<boolean>;
    addMember(teamId: number, userId: number, role: 'captain' | 'member'): Promise<void>;
    removeMember(teamId: number, userId: number): Promise<boolean>;
    updateMemberRole(teamId: number, userId: number, newRole: 'captain' | 'member'): Promise<boolean>;
    getTeamMembers(teamId: number): Promise<(User & { role: string, joined_at: Date })[]>;
    findTeamsByUserId(userId: number): Promise<Team[]>;
}

