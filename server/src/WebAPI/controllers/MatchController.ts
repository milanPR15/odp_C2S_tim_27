import { Router, Request, Response } from "express";
import { IMatchService } from "../../Domain/services/matches/IMatchService";
import { authenticate } from "../../Middlewares/authentification/AuthMiddleware";
import { authorize } from "../../Middlewares/authorization/AuthorizeMiddleware";
import { UserRole } from "../../Domain/enums/UserRole";
import { UpdateMatchResultDto } from "../../Domain/DTOs/matches/UpdateMatchResultDto";
import { validateUpdateMatchResult } from "../validators/matches/validateUpdateMatchResult";

export class MatchController {
  private readonly router = Router();

  public constructor(private readonly matchService: IMatchService) {
    this.setupRoutes();
  }

  private setupRoutes(): void {

    this.router.get("/tournament/:tournamentId", this.getMatchesByTournament.bind(this));
    this.router.get("/:id", this.getMatchById.bind(this));

    this.router.patch("/:id/result", authenticate, authorize(UserRole.ADMIN), this.updateMatchResult.bind(this));

    this.router.post("/:id/players", authenticate, this.addPlayerToMatch.bind(this));
    this.router.delete("/:id/players/:userId", authenticate, this.removePlayerFromMatch.bind(this));
  }

  private async getMatchesByTournament(req: Request, res: Response): Promise<void> {
    const tournamentId = parseInt(req.params.tournamentId as string, 10);
    if (isNaN(tournamentId)) {
      res.status(400).json({ success: false, message: "Invalid tournament ID" });
      return;
    }

    const result = await this.matchService.getMatchesByTournament(tournamentId);
    res.status(result.success ? 200 : (result.statusCode || 500)).json(result);
  }

  private async getMatchById(req: Request, res: Response): Promise<void> {
    const matchId = parseInt(req.params.id as string, 10);
    if (isNaN(matchId)) {
      res.status(400).json({ success: false, message: "Invalid match ID" });
      return;
    }

    const result = await this.matchService.getMatchById(matchId);
    res.status(result.success ? 200 : (result.statusCode || 500)).json(result);
  }

  private async updateMatchResult(req: Request, res: Response): Promise<void> {
    const matchId = parseInt(req.params.id as string, 10);
    if (isNaN(matchId)) {
      res.status(400).json({ success: false, message: "Invalid match ID" });
      return;
    }

    const dto = new UpdateMatchResultDto(req.body.result);

    const validation = validateUpdateMatchResult(dto);
    if (!validation.valid) {
      res.status(400).json({ success: false, message: validation.message });
      return;
    }

    const result = await this.matchService.updateMatchResult(matchId, req.user!.id, dto);
    res.status(result.success ? 200 : (result.statusCode || 500)).json(result);
  }

  private async addPlayerToMatch(req: Request, res: Response): Promise<void> {
    const matchId = parseInt(req.params.id as string, 10);
    if (isNaN(matchId)) {
      res.status(400).json({ success: false, message: "Invalid match ID" });
      return;
    }

    const { userId, teamId, performanceNotes } = req.body;

    if (!userId || !teamId) {
      res.status(400).json({ success: false, message: "userId and teamId are required" });
      return;
    }

    const result = await this.matchService.addPlayerToMatch(
      matchId,
      req.user!.id,
      Number(userId),
      Number(teamId),
      performanceNotes
    );

    res.status(result.success ? 200 : (result.statusCode || 500)).json(result);
  }

  private async removePlayerFromMatch(req: Request, res: Response): Promise<void> {
    const matchId = parseInt(req.params.id as string, 10);
    const userId = parseInt(req.params.userId as string, 10);

    if (isNaN(matchId) || isNaN(userId)) {
      res.status(400).json({ success: false, message: "Invalid IDs" });
      return;
    }

    const result = await this.matchService.removePlayerFromMatch(
      matchId,
      req.user!.id,
      userId
    );

    res.status(result.success ? 200 : (result.statusCode || 500)).json(result);
  }

  public getRouter(): Router {
    return this.router;
  }
  
}