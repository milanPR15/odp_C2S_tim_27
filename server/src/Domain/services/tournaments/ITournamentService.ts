import { TournamentDto } from "../../DTOs/tournaments/TournamentDto";
import { CreateTournamentDto } from "../../DTOs/tournaments/CreateTournamentDto";
import { UpdateTournamentDto } from "../../DTOs/tournaments/UpdateTournamentDto";
import { Result } from "../../types/Result";

export interface ITournamentService {
  getAll(): Promise<Result<TournamentDto[]>>;
  getById(id: number): Promise<Result<TournamentDto>>;
  getByGameId(gameId: number): Promise<Result<TournamentDto[]>>;
  create(tournament: CreateTournamentDto, userId?: number): Promise<Result<TournamentDto>>;
  update(id: number, tournament: UpdateTournamentDto, userId?: number): Promise<Result<TournamentDto>>;
  delete(id: number, userId?: number): Promise<Result<void>>;
}