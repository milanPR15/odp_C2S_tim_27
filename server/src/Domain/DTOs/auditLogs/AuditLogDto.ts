export class AuditLogDto {
    constructor(
        public id: number,
        public user_id: number,
        public action: string,
        public entity: string,
        public entity_id: number,
        public meta: string,
        public ip_address: string,
        public created_at: Date
    ) {}
}