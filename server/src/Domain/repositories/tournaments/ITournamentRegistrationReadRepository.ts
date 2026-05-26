import { TournamentRegistration } from "../../models/TournamentRegistration";
import { TournamentRegistrationDto } from "../../DTOs/tournaments/TournamentRegistrationDto";

export interface ITournamentRegistrationReadRepository {
  findById(id: number): Promise<TournamentRegistration>;
  findByTournamentAndTeam(tournamentId: number, teamId: number): Promise<TournamentRegistration>;
  findByTournament(tournamentId: number): Promise<TournamentRegistrationDto[]>;
  countByTournament(tournamentId: number): Promise<number>;
  countConfirmedByTournament(tournamentId: number): Promise<number>;
}
