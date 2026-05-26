import { TournamentRegistration } from "../../models/TournamentRegistration";
import { RegistrationStatus } from "../../enums/RegistrationStatus";

export interface ITournamentRegistrationWriteRepository {
  create(registration: TournamentRegistration): Promise<TournamentRegistration>;
  updateStatus(id: number, status: RegistrationStatus): Promise<boolean>;
}
