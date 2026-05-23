export enum TeamRole {
  CAPTAIN = 'captain',
  MEMBER = 'member'
}

export const isTeamRole = (role: string): role is TeamRole => {
  return Object.values(TeamRole).includes(role as TeamRole);
};