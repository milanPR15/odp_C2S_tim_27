export interface TeamRow {
  team_id: number;
  team_name: string;
  tag: string;
  logo: string;
  description: string | null;
  created_at: Date | string | null;
  updated_at: Date | string | null;
}

export class Team{
    public constructor(
        public team_id: number=0,
        public team_name: string = "",
        public tag: string = "", 
        public logo: string = "",
        public description: string | null = null,
        public createdAt: Date = new Date(), 
        public updatedAt: Date = new Date()
    ){}

    static fromDB(row: TeamRow): Team {
    return new Team(
      row.team_id,
      row.team_name,
      row.tag,
      row.logo,
      row.description,
      row.created_at ? new Date(row.created_at) : new Date(),
      row.updated_at ? new Date(row.updated_at) : new Date()
    );
  }
}