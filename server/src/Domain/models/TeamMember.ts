export class TeamMember{
    constructor(
        public id: number = 0,
        public team_id: number = 0,
        public user_id: number = 0,
        public role: 'captain' | 'member' = 'member',
        public joined_at: Date = new Date()
    ){}
}