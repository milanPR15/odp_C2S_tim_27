export class UserWatchlist{
    constructor(
        public id: number = 0,
        public user_id: number = 0,
        public tournament_id: number = 0, 
        public added_at: Date = new Date()
    ){}
}