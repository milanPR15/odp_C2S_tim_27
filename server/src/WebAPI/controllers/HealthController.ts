import { Router, Request, Response } from "express";
import { DbManager } from "../../Database/connection/DbConnectionPool";
import { authenticate } from "../../Middlewares/authentification/AuthMiddleware";
import { authorize } from "../../Middlewares/authorization/AuthorizeMiddleware";
import { UserRole } from "../../Domain/enums/UserRole";

export class HealthController {
  private readonly router = Router();

  constructor(private readonly db: DbManager) {
    this.router.get(
      "/health/db",
      authenticate,
      authorize(UserRole.ADMIN),
      this.getDbHealth.bind(this)
    );
  }

  private async getDbHealth(req: Request, res: Response): Promise<void> {
    try {
      const nodes = this.db.getNodes();
      const payload = nodes.map((n) => ({
        name: n.name,
        host: n.host,
        port: n.port,
        status: n.status,
        lastCheck: n.lastCheck ? n.lastCheck.toISOString() : null,
        successfulWrites: n.successfulWrites ?? 0,
        failedWrites: n.failedWrites ?? 0,
      }));
      res.status(200).json({ success: true, data: payload });
    } catch (err) {
      res.status(500).json({ success: false, message: "Failed to read DB health" });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}
