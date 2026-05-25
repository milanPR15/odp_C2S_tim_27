import { Router, Request, Response } from "express";
import { ITournamentService } from "../../Domain/services/tournaments/ITournamentService";
import { authenticate } from "../../Middlewares/authentification/AuthMiddleware";
import { authorize } from "../../Middlewares/authorization/AuthorizeMiddleware";
import { UserRole } from "../../Domain/enums/UserRole";
import { RegisterTournamentTeamDto } from "../../Domain/DTOs/tournaments/RegisterTournamentTeamDto";

export class TournamentController {
    private readonly router = Router();

    public constructor(private readonly tournamentService: ITournamentService)
    {
        this.router.get("/tournaments", this.getAll.bind(this));
        this.router.get("/tournaments/game/:gameId", this.getByGameId.bind(this));
        this.router.get("/tournaments/:id/registrations/count", this.getRegistrationCount.bind(this));
        this.router.get("/tournaments/:id/registrations", authenticate, authorize(UserRole.ADMIN), this.getRegistrations.bind(this));
        this.router.patch("/tournaments/:id/registrations/:registrationId/confirm", authenticate, authorize(UserRole.ADMIN), this.confirmRegistration.bind(this));
        this.router.get("/tournaments/:id", this.getById.bind(this));
        this.router.post("/tournaments", authenticate, authorize(UserRole.ADMIN), this.create.bind(this));
        this.router.put("/tournaments/:id", authenticate, authorize(UserRole.ADMIN), this.update.bind(this));
        this.router.delete("/tournaments/:id", authenticate, authorize(UserRole.ADMIN), this.delete.bind(this));
        this.router.post("/tournaments/:id/register", authenticate, this.registerTeam.bind(this));
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

    private async getRegistrationCount(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id as string, 10);
        if (isNaN(id)) {
            res.status(400).json({ success: false, message: "Invalid tournament ID syntax" });
            return;
        }

        const result = await this.tournamentService.getRegistrationCount(id);
        if (!result.success) {
            res.status(result.statusCode).json({ success: false, message: result.error });
            return;
        }

        res.status(200).json({ success: true, data: result.data });
    }

    private async getRegistrations(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id as string, 10);
        if (isNaN(id)) {
            res.status(400).json({ success: false, message: "Invalid tournament ID syntax" });
            return;
        }

        const result = await this.tournamentService.getRegistrations(id);
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

    private async registerTeam(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id as string, 10);
        if (isNaN(id)) {
            res.status(400).json({ success: false, message: "Invalid tournament ID syntax" });
            return;
        }

        const dto = new RegisterTournamentTeamDto(
            Number(req.body.teamId),
            Array.isArray(req.body.playerIds) ? req.body.playerIds.map((value: string | number) => Number(value)) : []
        );

        const userId = req.user?.id || 0;
        const result = await this.tournamentService.registerTeam(id, userId, dto);

        if (!result.success) {
            res.status(result.statusCode).json({ success: false, message: result.error });
            return;
        }

        res.status(201).json({ success: true, message: "Team registered successfully." });
    }

    private async confirmRegistration(req: Request, res: Response): Promise<void> {
        const tournamentId = parseInt(req.params.id as string, 10);
        const registrationId = parseInt(req.params.registrationId as string, 10);

        if (isNaN(tournamentId) || isNaN(registrationId)) {
            res.status(400).json({ success: false, message: "Invalid tournament or registration ID syntax" });
            return;
        }

        const result = await this.tournamentService.confirmRegistration(tournamentId, registrationId, req.user?.id || 0);

        if (!result.success) {
            res.status(result.statusCode).json({ success: false, message: result.error });
            return;
        }

        res.status(200).json({ success: true, message: "Tournament registration confirmed successfully." });
    }

    public getRouter(): Router { return this.router; }
}