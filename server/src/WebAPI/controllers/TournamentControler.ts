import { Router, Request, Response } from "express";
import { ITournamentService } from "../../Domain/services/tournaments/ITournamentService";
import { authenticate } from "../../Middlewares/authentification/AuthMiddleware";
import { authorize } from "../../Middlewares/authorization/AuthorizeMiddleware";
import { UserRole } from "../../Domain/enums/UserRole";

export class TournamentController {
    private readonly router = Router();

    public constructor(private readonly tournamentService: ITournamentService)
    {
        this.router.get("/tournaments", authenticate, this.getAll.bind(this));
        this.router.get("/tournaments/game/:gameId", authenticate, this.getByGameId.bind(this));
        this.router.get("/tournaments/:id", authenticate, this.getById.bind(this));
        this.router.post("/tournaments", authenticate, authorize(UserRole.ADMIN), this.create.bind(this));
        this.router.put("/tournaments/:id", authenticate, authorize(UserRole.ADMIN), this.update.bind(this));
        this.router.delete("/tournaments/:id", authenticate, authorize(UserRole.ADMIN), this.delete.bind(this));
    }

    private async getAll(req: Request, res: Response): Promise<void> {
        const result = await this.tournamentService.getAll();
        if (!result.success) {
            res.status(result.statusCode).json({ success: false, message: result.error });
            return;
        }
        res.status(200).json({ success: true, data: result.data });
    }

    private async getByGameId(req: Request, res: Response): Promise<void> {
        const gameId = parseInt(req.params.gameId as string, 10);
        if (isNaN(gameId)) {
            res.status(400).json({ success: false, message: "Invalid game ID syntax" });
            return;
        }
        const result = await this.tournamentService.getByGameId(gameId);
        if (!result.success) {
            res.status(result.statusCode).json({ success: false, message: result.error });
            return;
        }
        res.status(200).json({ success: true, data: result.data });
    }

    private async getById(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id as string, 10);
        if (isNaN(id)) {
            res.status(400).json({ success: false, message: "Invalid tournament ID syntax" });
            return;
        }
        const result = await this.tournamentService.getById(id);
        if (!result.success) {
            res.status(result.statusCode).json({ success: false, message: result.error });
            return;
        }
        res.status(200).json({ success: true, data: result.data });
    }

    private async create(req: Request, res: Response): Promise<void> {
        const userId = req.user?.id || 0;
        const result = await this.tournamentService.create(req.body, userId);
        if (!result.success) {
            res.status(result.statusCode).json({ success: false, message: result.error });
            return;
        }
        res.status(201).json({ success: true, data: result.data });
    }

    private async update(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id as string, 10);
        if (isNaN(id)) {
            res.status(400).json({ success: false, message: "Invalid tournament ID syntax" });
            return;
        }
        const userId = req.user?.id || 0;
        const result = await this.tournamentService.update(id, req.body, userId);
        if (!result.success) {
            res.status(result.statusCode).json({ success: false, message: result.error });
            return;
        }
        res.status(200).json({ success: true, data: result.data });
    }

    private async delete(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id as string, 10);
        if (isNaN(id)) {
            res.status(400).json({ success: false, message: "Invalid tournament ID syntax" });
            return;
        }
        const userId = req.user?.id || 0;
        const result = await this.tournamentService.delete(id, userId);
        if (!result.success) {
            res.status(result.statusCode).json({ success: false, message: result.error });
            return;
        }
        res.status(200).json({ success: true, message: "Tournament deleted successfully" });
    }

    public getRouter(): Router { return this.router; }
}