export class AuditLog{
    constructor(
        public id: number = 0,
        public user_id: number = 0,
        public action: string = "",
        public entity: string = "",
        public entity_id: number = 0,
        public meta: string = "",
        public ip_address: string = "",
        public created_at: Date = new Date()
    ){}
}