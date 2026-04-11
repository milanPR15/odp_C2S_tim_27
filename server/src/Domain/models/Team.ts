export class Team{
    public constructor(
        public id: number=0,
        public name: string = "",
        public tag: string = "",
        public captainId: number = 0, 
        public logo: string | null = null,
        public description: string | null = null,
        public createdAt: Date = new Date()
    ){}
}