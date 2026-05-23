import { TournamentRegistration } from "../../models/TournamentRegistration";
import { TournamentRegistrationDto } from "../../DTOs/tournaments/TournamentRegistrationDto";
import { RegistrationStatus } from "../../enums/RegistrationStatus";

export interface ITournamentRegistrationRepository {
  findById(id: number): Promise<TournamentRegistration | null>;
  findByTournamentAndTeam(tournamentId: number, teamId: number): Promise<TournamentRegistration | null>;
  findByTournament(tournamentId: number): Promise<TournamentRegistrationDto[]>;
  countByTournament(tournamentId: number): Promise<number>;
  countConfirmedByTournament(tournamentId: number): Promise<number>;
  create(registration: TournamentRegistration): Promise<TournamentRegistration | null>;
  updateStatus(id: number, status: RegistrationStatus): Promise<boolean>;
}