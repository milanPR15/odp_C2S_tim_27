export class Game {
    public constructor(
        public game_id: number = 0, 
        public title: string = "",
        public genre: string = "",
        public max_players: number = 0,
        public logo: string = "",
        public createdAt: Date = new Date(), 
        public updatedAt: Date = new Date()
    ){}
}