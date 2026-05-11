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
}

export interface CreateTeamDto {
  team_name: string;
  tag: string;
  logo?: string;
  description?: string;
}

export interface UpdateTeamDto extends Partial<CreateTeamDto> {}
