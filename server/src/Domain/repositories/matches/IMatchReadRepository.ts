import { Match } from "../../models/Match";
import { MatchPlayer } from "../../models/MatchPlayers";

export interface IMatchReadRepository {
  findByTournament(tournamentId: number): Promise<Match[]>;
  findById(matchId: number): Promise<Match>;
  findPlayers(matchId: number): Promise<MatchPlayer[]>;
  isCaptainOfTeamInMatch(matchId: number, captainId: number): Promise<boolean>;
  isPlayerInMatchTeam(matchId: number, userId: number): Promise<boolean>;
  getPlayerTeam(matchId: number, userId: number): Promise<number | null>;
}