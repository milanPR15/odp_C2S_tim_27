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
        const games = await this.gameService.getAll();
        res.status(200).json({ success: true, data: games });
    }

    private async getById(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id as string, 10);
        const game = await this.gameService.getById(id);
        if (!game) {
            res.status(404).json({ success: false, message: "Game not found" });
            return;
        }
        res.status(200).json({ success: true, data: game });
    }

    private async create(req: Request, res: Response): Promise<void> {
        const game = await this.gameService.create(req.body);
        if (!game) {
            res.status(400).json({ success: false, message: "Failed to create game" });
            return;
        }
        res.status(201).json({ success: true, data: game });
    }

    private async update(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id as string, 10);
        const game = await this.gameService.update(id, req.body);
        if (!game) {
            res.status(404).json({ success: false, message: "Game not found" });
            return;
        }
        res.status(200).json({ success: true, data: game });
    }

    private async delete(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id as string, 10);
        const deleted = await this.gameService.delete(id);
        if (!deleted) {
            res.status(404).json({ success: false, message: "Game not found" });
            return;
        }
        res.status(200).json({ success: true, message: "Game deleted successfully" });
    }

    public getRouter(): Router { return this.router; }
}