export interface IUserWatchlistReadRepository {
  findByUserId(userId: number): Promise<{ id: number; user_id: number; tournament_id: number; added_at: Date }[]>;
  exists(userId: number, tournamentId: number): Promise<boolean>;
}
