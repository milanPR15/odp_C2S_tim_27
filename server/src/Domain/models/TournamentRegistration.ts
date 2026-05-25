import { RegistrationStatus } from "../enums/RegistrationStatus";

export class TournamentRegistration{
    constructor(
        public id: number = 0,
        public tournament_id: number = 0, 
        public team_id: number = 0,
        public status:  RegistrationStatus = RegistrationStatus.PENDING, 
        public seed: number = 0,
        public registered_at: Date = new Date(),
        public selected_player_ids: number[] = []
    ){}
}