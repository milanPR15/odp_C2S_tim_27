import { Router, Request, Response } from "express";
import { IAuditLogService } from "../../Domain/services/auditLogs/IAuditLogService";
import { authenticate } from "../../Middlewares/authentification/AuthMiddleware";
import { authorize } from "../../Middlewares/authorization/AuthorizeMiddleware";
import { UserRole } from "../../Domain/enums/UserRole";

export class AuditLogController {
    private readonly router = Router();

    public constructor(private readonly auditLogService: IAuditLogService) {
        this.router.get("/audit-logs", authenticate, authorize(UserRole.ADMIN), this.getAll.bind(this));
    }

    private async getAll(req: Request, res: Response): Promise<void> {
        const result = await this.auditLogService.getAll();
        if (!result.success) {
            res.status(result.statusCode || 500).json({ success: false, message: result.error || "Failed to fetch audit logs" });
            return;
        }
        res.status(200).json({ success: true, data: result.data });
    }

    public getRouter(): Router {
        return this.router;
    }
}