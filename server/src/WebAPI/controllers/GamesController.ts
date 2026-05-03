import { Router, Request, Response } from "express";
import { IGamesService } from "../../Domain/services/games/IGamesService";
import { authenticate } from "../../Middlewares/authentification/AuthMiddleware";
import { UserRole } from "../../Domain/enums/UserRole";
import { authorize } from "../../Middlewares/authorization/AuthorizeMiddleware";

export class GameController {
    private readonly router = Router();

    public constructor(private readonly gameService: IGamesService)
    {
        this.router.get("/games", authenticate, this.getAll.bind(this));
        this.router.get("/games/:id", authenticate, this.getById.bind(this));
        this.router.post("/games", authenticate, authorize(UserRole.ADMIN), this.create.bind(this));
        this.router.put("/games/:id", authenticate, authorize(UserRole.ADMIN), this.update.bind(this));
        this.router.delete("/games/:id", authenticate, authorize(UserRole.ADMIN), this.delete.bind(this));
    }

    private async getAll(req: Request, res: Response): Promise<void> {
        const result = await this.gameService.getAll();
        if (!result.success) {
            res.status(result.statusCode || 500).json({ success: false, message: result.error || "Games not found" });
            return;
        }
        res.status(200).json({ success: true, data: result.data });
    }

    private async getById(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id as string, 10);
        if (isNaN(id)) {
            res.status(400).json({ success: false, message: "Invalid game ID syntax" });
            return;
        }
        const result = await this.gameService.getById(id);
        if (!result.success) {
            res.status(result.statusCode || 404).json({ success: false, message: result.error || "Game not found" });
            return;
        }
        res.status(200).json({ success: true, data: result.data });
    }

    private async create(req: Request, res: Response): Promise<void> {
        const userId = req.user?.id || 0;
        const result = await this.gameService.create(req.body, userId);
        if (!result.success) {
            res.status(result.statusCode || 400).json({ success: false, message: result.error || "Failed to create game" });
            return;
        }
        res.status(201).json({ success: true, data: result.data });
    }

    private async update(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id as string, 10);
        if (isNaN(id)) {
            res.status(400).json({ success: false, message: "Invalid game ID syntax" });
            return;
        }
        const userId = req.user?.id || 0;
        const result = await this.gameService.update(id, req.body, userId);
        if (!result.success) {
            res.status(result.statusCode || 404).json({ success: false, message: result.error || "Game not found" });
            return;
        }
        res.status(200).json({ success: true, data: result.data });
    }

    private async delete(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id as string, 10);
        if (isNaN(id)) {
            res.status(400).json({ success: false, message: "Invalid game ID syntax" });
            return;
        }
        const userId = req.user?.id || 0;
        const result = await this.gameService.delete(id, userId);
        if (!result.success) {
            res.status(result.statusCode || 404).json({ success: false, message: result.error || "Game not found" });
            return;
        }
        res.status(200).json({ success: true, message: "Game deleted successfully" });
    }

    public getRouter(): Router { return this.router; }
}