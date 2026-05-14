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

    static fromDB(row: any): Team {
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