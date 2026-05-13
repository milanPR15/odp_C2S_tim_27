export interface TeamMemberDto {
  user_id: number;
  gamer_tag: string;
  full_name: string;
  role: 'captain' | 'member';
  joined_at: string | Date;
}

export interface TeamDto {
  team_id: number;
  team_name: string;
  tag: string;
  logo: string;
  description: string | null;
  captain_id?: number;
  captain_gamer_tag?: string;
  num_members?: number;
  createdAt: Date | string;
  members?: TeamMemberDto[];
}

export interface CreateTeamDto {
  team_name: string;
  tag: string;
  logo?: string;
  description?: string;
}

export type UpdateTeamDto = Partial<CreateTeamDto>

export interface TeamInvitationDto {
  id: number;
  team_id: number;
  user_id: number;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  team_name?: string;
  created_at?: string | Date;
}
