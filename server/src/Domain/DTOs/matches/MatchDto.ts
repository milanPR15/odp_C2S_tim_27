import { MatchPlayerDto } from "./MatchPlayerDto";

export class MatchDto {
  constructor(
    public match_id: number,
    public tournament_id: number,
    public team1_id: number,
    public team2_id: number,
    public scheduled_at: Date,
    public result: string,
    public next_match_id: number = 0,
    public next_match_slot: 'team1' | 'team2' | '' = '',
    public loser_next_match_id: number = 0,
    public loser_next_match_slot: 'team1' | 'team2' | '' = '',
    public status: string = 'scheduled',
    public players?: MatchPlayerDto[]   
  ) {}
}