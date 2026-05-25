export interface MatchRow {
  match_id: number;
  tournament_id: number;
  team1_id: number;
  team2_id: number;

  winner_team_id: number;
  next_match_id: number;
  next_match_slot: 'team1' | 'team2' | '';
  loser_next_match_id: number;
  loser_next_match_slot: 'team1' | 'team2' | '';
  status: string;

  scheduled_at: string;
  result: string;

  created_at?: string;
  updated_at?: string;
}

export class Match {
  constructor(
    public match_id: number = 0,
    public tournament_id: number = 0,
    public team1_id: number = 0,
    public team2_id: number = 0,

    public winner_team_id: number = 0,
    public next_match_id: number = 0,
    public next_match_slot: 'team1' | 'team2' | '' = '',
    public loser_next_match_id: number = 0,
    public loser_next_match_slot: 'team1' | 'team2' | '' = '',
    public status: string = 'scheduled',

    public scheduled_at: Date = new Date(),
    public result: string = "",      
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  static fromDB(row: MatchRow): Match {
    return new Match(
      row.match_id,
      row.tournament_id,
      row.team1_id,
      row.team2_id,
      row.winner_team_id ?? 0,
      row.next_match_id ?? 0,
      row.next_match_slot ?? '',
      row.loser_next_match_id ?? 0,
      row.loser_next_match_slot ?? '',
      row.status,
      new Date(row.scheduled_at),
      row.result ?? "",
      row.created_at ? new Date(row.created_at) : new Date(),
      row.updated_at ? new Date(row.updated_at) : new Date()
    );
  }
}