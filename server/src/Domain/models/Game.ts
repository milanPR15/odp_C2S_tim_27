export class Game {
    public constructor(
        public id: number = 0, 
        public title: string = "",
        public genre: string = "",
        public maxPlayersPerTeam: number = 5,
        public logo: string | null = null
    ){}
}