import { Tournament } from './Tournament';
export class Match{
    public constructor(
        public id: number = 0,
        public tournamentId: number = 0,
        public team1Id: number | null = null,
        public team2Id: number | null = null,
        public winnerId: number | null = null,
        public score: string | null = null, 
        public round: number = 1, 
        public status: 'scheduled' | 'ongoing' | 'completed' = 'scheduled'
    ){}
}