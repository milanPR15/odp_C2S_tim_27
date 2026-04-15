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
        this.router.get("/tournaments/:id", authenticate, this.getById.bind(this));
        this.router.post("/tournaments", authenticate, authorize(UserRole.ADMIN), this.create.bind(this));
        this.router.put("/tournaments/:id", authenticate, authorize(UserRole.ADMIN), this.update.bind(this));
        this.router.delete("/tournaments/:id", authenticate, authorize(UserRole.ADMIN), this.delete.bind(this));
    }

    private async getAll(req: Request, res: Response): Promise<void> {
        const tournaments = await this.tournamentService.getAll();
        res.status(200).json({ success: true, data: tournaments });
    }

    private async getById(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id as string, 10);
        const tournament = await this.tournamentService.getById(id);
        if (!tournament) {
            res.status(404).json({ success: false, message: "Tournament not found" });
            return;
        }
        res.status(200).json({ success: true, data: tournament });
    }

    private async create(req: Request, res: Response): Promise<void> {
        const tournament = await this.tournamentService.create(req.body);
        if (!tournament) {
            res.status(400).json({ success: false, message: "Failed to create tournament" });
            return;
        }
        res.status(201).json({ success: true, data: tournament });
    }

    private async update(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id as string, 10);
        const tournament = await this.tournamentService.update(id, req.body);
        if (!tournament) {
            res.status(400).json({ success: false, message: "Failed to update tournament" });
            return;
        }
        res.status(200).json({ success: true, data: tournament });
    }

    private async delete(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id as string, 10);
        const success = await this.tournamentService.delete(id);
        if (!success) {
            res.status(400).json({ success: false, message: "Failed to delete tournament" });
            return;
        }
        res.status(200).json({ success: true, message: "Tournament deleted" });
    }

    public getRouter(): Router { return this.router; }
}