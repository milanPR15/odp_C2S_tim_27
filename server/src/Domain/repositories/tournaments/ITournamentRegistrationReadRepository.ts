import { TournamentRegistration } from "../../models/TournamentRegistration";

export interface ITournamentRegistrationReadRepository {
  findById(id: number): Promise<TournamentRegistration>;
  findByTournamentAndTeam(tournamentId: number, teamId: number): Promise<TournamentRegistration>;
  findByTournament(tournamentId: number): Promise<TournamentRegistration[]>;
  countByTournament(tournamentId: number): Promise<number>;
  countConfirmedByTournament(tournamentId: number): Promise<number>;
}
