export class AuditLogDto {
    constructor(
        public id: number,
        public user_id: number,
        public action: string,
        public entity: string,
        public entity_id: number,
        public meta: string | null,
        public ip_address: string | null,
        public created_at: Date
    ) {}
}