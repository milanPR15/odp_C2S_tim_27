export class Tournament{
    public constructor(
        public id: number = 0,
        public name: string = "",
        public gameId: number = 0, 
        public format: 'single_elimination' | 'double_elimination' | 'round_robin' = 'single_elimination',
        public maxTeams: number = 16,
        public registrationDeadline: Date = new Date(), 
        public prizePool: string | null = null,
        public status: 'upcoming' | 'ongoing' | 'completed' = 'upcoming'
    ){}
}