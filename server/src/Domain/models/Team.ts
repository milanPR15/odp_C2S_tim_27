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
}