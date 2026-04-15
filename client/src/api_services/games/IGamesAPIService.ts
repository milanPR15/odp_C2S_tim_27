import type { GameDto, CreateGameDto, UpdateGameDto } from "../../models/game/GameTypes";

export type ApiResponse<T> = { success: boolean; message: string; data?: T };

export interface IGamesAPIService {
  getAll(): Promise<ApiResponse<GameDto[]>>;
  getById(id: number): Promise<ApiResponse<GameDto>>;
  create(payload: CreateGameDto): Promise<ApiResponse<GameDto>>;
  update(id: number, payload: UpdateGameDto): Promise<ApiResponse<GameDto>>;
  delete(id: number): Promise<ApiResponse<void>>;
}