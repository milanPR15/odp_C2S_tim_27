export type AuditLogDto = {
    id: number;
    user_id: number;
    action: string;
    entity: string;
    entity_id: number;
    meta: string | null;
    ip_address: string | null;
    created_at: string;
};