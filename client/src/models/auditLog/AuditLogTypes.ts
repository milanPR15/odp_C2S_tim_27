export type AuditLogDto = {
    id: number;
    user_id: number;
    action: string;
    entity: string;
    entity_id: number;
    meta: string;
    ip_address: string;
    created_at: string;
};