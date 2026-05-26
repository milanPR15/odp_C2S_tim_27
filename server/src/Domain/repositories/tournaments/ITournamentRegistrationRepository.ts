import { TournamentRegistration } from "../../models/TournamentRegistration";
import { RegistrationStatus } from "../../enums/RegistrationStatus";

export interface ITournamentRegistrationRepository {
  findById(id: number): Promise<TournamentRegistration>;
  findByTournamentAndTeam(tournamentId: number, teamId: number): Promise<TournamentRegistration>;
  findByTournament(tournamentId: number): Promise<TournamentRegistration[]>;
  countByTournament(tournamentId: number): Promise<number>;
  countConfirmedByTournament(tournamentId: number): Promise<number>;
  create(registration: TournamentRegistration): Promise<TournamentRegistration>;
  updateStatus(id: number, status: RegistrationStatus): Promise<boolean>;
}