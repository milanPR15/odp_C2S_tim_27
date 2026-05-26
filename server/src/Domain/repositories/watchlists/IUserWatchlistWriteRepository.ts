export interface IUserWatchlistWriteRepository {
  create(userId: number, tournamentId: number): Promise<boolean>;
  delete(userId: number, tournamentId: number): Promise<boolean>;
}
