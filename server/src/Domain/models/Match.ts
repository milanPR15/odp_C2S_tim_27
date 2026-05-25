export interface MatchRow {
  match_id: number;
  tournament_id: number;
  team1_id: number;
  team2_id: number;

  winner_team_id: number | null;
  next_match_id: number | null;
  next_match_slot: 'team1' | 'team2' | null;
  loser_next_match_id: number | null;
  loser_next_match_slot: 'team1' | 'team2' | null;
  status: string;

  scheduled_at: string;
  result: string | null;

  created_at?: string;
  updated_at?: string;
}

export class Match {
  constructor(
    public match_id: number = 0,
    public tournament_id: number = 0,
    public team1_id: number = 0,
    public team2_id: number = 0,

    public winner_team_id: number | null = null,
    public next_match_id: number | null = null,
    public next_match_slot: 'team1' | 'team2' | null = null,
    public loser_next_match_id: number | null = null,
    public loser_next_match_slot: 'team1' | 'team2' | null = null,
    public status: string = 'scheduled',

    public scheduled_at: Date = new Date(),
    public result: string | null = null,      
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  static fromDB(row: MatchRow): Match {
    return new Match(
      row.match_id,
      row.tournament_id,
      row.team1_id,
      row.team2_id,
      row.winner_team_id,
      row.next_match_id,
      row.next_match_slot,
      row.loser_next_match_id,
      row.loser_next_match_slot,
      row.status,
      new Date(row.scheduled_at),
      row.result,
      row.created_at ? new Date(row.created_at) : new Date(),
      row.updated_at ? new Date(row.updated_at) : new Date()
    );
  }
}