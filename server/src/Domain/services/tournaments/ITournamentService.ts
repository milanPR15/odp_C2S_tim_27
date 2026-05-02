import { TournamentDto } from "../../DTOs/tournaments/TournamentDto";
import { CreateTournamentDto } from "../../DTOs/tournaments/CreateTournamentDto";
import { UpdateTournamentDto } from "../../DTOs/tournaments/UpdateTournamentDto";

export interface ITournamentService {
  getAll(): Promise<TournamentDto[]>;
  getById(id: number): Promise<TournamentDto | null>;
  getByGameId(gameId: number): Promise<TournamentDto[]>;
  create(tournament: CreateTournamentDto): Promise<TournamentDto | null>;
  update(id: number, tournament: UpdateTournamentDto): Promise<TournamentDto | null>;
  delete(id: number): Promise<boolean>;
}