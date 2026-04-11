export class MatchPlayer{
    constructor(
        public id: number = 0,
        public match_id: number = 0,
        public user_id: number = 0,
        public team_id: number = 0, 
        public performance_notes: string | null = null
    ){}
}