export type CreateGameDto = {
  title: string;
  genre: string;
  max_players: number;
  logo: string;
};

export type GameDto = {
  game_id: number;
  title: string;
  genre: string;
  max_players: number;
  logo: string;
  createdAt: string;
  updatedAt: string;
};

export type UpdateGameDto = Partial<CreateGameDto>;