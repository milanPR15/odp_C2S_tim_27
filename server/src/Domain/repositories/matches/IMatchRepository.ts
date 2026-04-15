import { Match } from "../../models/Match"; 
import { User } from "../../models/User";

export interface IMatchRepository {
    findById(id: number): Promise<Match | null>;
    findByTournamentId(tournamentId: number): Promise<Match[]>;
    updateResult(matchId: number, score: string): Promise<boolean>;
    addActivePlayer(matchId: number, userId: number, teamId: number, performanceNotes?: string): Promise<void>;    
    updatePerformanceNotes(matchId: number, userId: number, notes: string): Promise<boolean>;
    removeActivePlayer(matchId: number, userId: number): Promise<boolean>;
    getActivePlayers(matchId: number): Promise<(User & { team_id: number, performance_notes: string | null })[]>;
    bulkCreateMatches(matches: Partial<Match>[]): Promise<void>;
}