export class Match {
  constructor(
    public match_id: number = 0,
    public tournament_id: number = 0,
    public team1_id: number = 0,
    public team2_id: number = 0,
    public scheduled_at: Date = new Date(),
    public result: string | null = null,      
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  static fromDB(row: any): Match {
    return new Match(
      row.match_id,
      row.tournament_id,
      row.team1_id,
      row.team2_id,
      new Date(row.scheduled_at),
      row.result,
      row.created_at ? new Date(row.created_at) : new Date(),
      row.updated_at ? new Date(row.updated_at) : new Date()
    );
  }
}