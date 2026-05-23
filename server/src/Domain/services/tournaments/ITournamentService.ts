import { TournamentDto } from "../../DTOs/tournaments/TournamentDto";
import { CreateTournamentDto } from "../../DTOs/tournaments/CreateTournamentDto";
import { UpdateTournamentDto } from "../../DTOs/tournaments/UpdateTournamentDto";
import { RegisterTournamentTeamDto } from "../../DTOs/tournaments/RegisterTournamentTeamDto";
import { TournamentRegistrationDto } from "../../DTOs/tournaments/TournamentRegistrationDto";
import { Result } from "../../types/Result";

export interface ITournamentService {
  getAll(): Promise<Result<TournamentDto[]>>;
  getById(id: number): Promise<Result<TournamentDto>>;
  getByGameId(gameId: number): Promise<Result<TournamentDto[]>>;
  getRegistrationCount(id: number): Promise<Result<number>>;
  getRegistrations(id: number): Promise<Result<TournamentRegistrationDto[]>>;
  create(tournament: CreateTournamentDto, userId?: number): Promise<Result<TournamentDto>>;
  update(id: number, tournament: UpdateTournamentDto, userId?: number): Promise<Result<TournamentDto>>;
  delete(id: number, userId?: number): Promise<Result<void>>;
  registerTeam(tournamentId: number, userId: number, dto: RegisterTournamentTeamDto): Promise<Result<void>>;
  confirmRegistration(tournamentId: number, registrationId: number, userId: number): Promise<Result<void>>;
}