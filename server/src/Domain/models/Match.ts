import { MatchStatus } from '../enums/MatchStatus';
import { Tournament } from './Tournament';
export class Match{
    public constructor(
        public match_id: number = 0,
        public tournament_id: number = 0,
        public team1_id: number | null = null,
        public team2_id: number | null = null,
        public scheduledAt: Date = new Date(),
        public updatedAt: Date = new Date(),
        public createdAt: Date =  new Date(),
        public result: string | null = null
    ){}
}