export class CreateGameDto {
    public constructor(
        public title: string = "",
        public genre: string = "",
        public max_players: number = 0,
        public logo: string = ""
    ){}
}