import { MatchPlayerDto } from "./MatchPlayerDto";

export class MatchDto {
  constructor(
    public match_id: number,
    public tournament_id: number,
    public team1_id: number,
    public team2_id: number,
    public scheduled_at: Date,
    public result: string | null,
    public players?: MatchPlayerDto[]   
  ) {}
}