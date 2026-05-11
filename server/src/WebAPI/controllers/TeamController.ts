import { Router, Request, Response } from "express";
import { ITeamService } from "../../Domain/services/teams/ITeamService";
import { authenticate } from "../../Middlewares/authentification/AuthMiddleware";
import { CreateTeamDto } from "../../Domain/DTOs/teams/CreateTeamDto";

export class TeamController {
  private readonly router = Router();

  public constructor(private readonly teamService: ITeamService) {
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // Javne i korisničke rute
    this.router.get("/teams", authenticate, this.getMyTeams.bind(this));
    this.router.post("/teams", authenticate, this.createTeam.bind(this));
    this.router.get("/teams/:id", this.getTeamById.bind(this));

    // Captain / članovi rute (za sada nedovršene)
    this.router.put("/teams/:id", authenticate, this.updateTeam.bind(this));
    this.router.delete("/teams/:id", authenticate, this.deleteTeam.bind(this));

    this.router.post("/teams/:id/invite", authenticate, this.sendInvite.bind(this));
    this.router.post("/teams/:id/invite/respond", authenticate, this.respondToInvite.bind(this));

    this.router.patch("/teams/:id/members/:userId/role", authenticate, this.transferCaptain.bind(this));
    this.router.delete("/teams/:id/members/:userId", authenticate, this.removeMember.bind(this));
  }

  private async getMyTeams(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const result = await this.teamService.getMyTeams(userId);
    if (!result.success) {
      res.status(result.statusCode || 500).json({ success: false, message: result.error });
      return;
    }
    res.status(200).json({ success: true, data: result.data });
  }

  private async createTeam(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const dto = new CreateTeamDto(
      req.body.team_name,
      req.body.tag,
      req.body.logo || "",
      req.body.description || null
    );

    const result = await this.teamService.createTeam(userId, dto);
    if (!result.success) {
      res.status(result.statusCode || 400).json({ success: false, message: result.error });
      return;
    }

    res.status(201).json({ success: true, data: result.data });
  }

  private async getTeamById(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: "Invalid team ID" });
      return;
    }

    const result = await this.teamService.getTeamById(id);
    if (!result.success) {
      res.status(result.statusCode || 404).json({ success: false, message: result.error });
      return;
    }

    res.status(200).json({ success: true, data: result.data });
  }

  // Ostale metode za sada ostavljamo kao "Not implemented"
  private async updateTeam(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: "Invalid team ID" });
      return;
    }

    const dto: Partial<CreateTeamDto> = req.body;
    const result = await this.teamService.updateTeam(id, userId, dto);
    
    if (!result.success) {
      res.status(result.statusCode || 400).json({ success: false, message: result.error });
      return;
    }

    res.status(200).json({ success: true, data: result.data });
  }

  private async deleteTeam(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: "Invalid team ID" });
      return;
    }

    const result = await this.teamService.deleteTeam(id, userId);
    
    if (!result.success) {
      res.status(result.statusCode || 400).json({ success: false, message: result.error });
      return;
    }

    res.status(200).json({ success: true, message: "Team deleted successfully" });
  }

  private async sendInvite(req: Request, res: Response): Promise<void> {
    res.status(501).json({ success: false, message: "Not implemented yet" });
  }

  private async respondToInvite(req: Request, res: Response): Promise<void> {
    res.status(501).json({ success: false, message: "Not implemented yet" });
  }

  private async transferCaptain(req: Request, res: Response): Promise<void> {
    const requesterId = req.user!.id;
    const teamId = parseInt(req.params.id as string, 10);
    const newCaptainId = parseInt(req.params.userId as string, 10);

    if (isNaN(teamId) || isNaN(newCaptainId)) {
      res.status(400).json({ success: false, message: "Invalid IDs provided" });
      return;
    }

    const result = await this.teamService.transferCaptain(teamId, requesterId, newCaptainId);
    
    if (!result.success) {
      res.status(result.statusCode || 400).json({ success: false, message: result.error });
      return;
    }

    res.status(200).json({ success: true, message: "Captain transferred successfully" });
  }

  private async removeMember(req: Request, res: Response): Promise<void> {
    const requesterId = req.user!.id;
    const teamId = parseInt(req.params.id as string, 10);
    const targetUserId = parseInt(req.params.userId as string, 10);

    if (isNaN(teamId) || isNaN(targetUserId)) {
      res.status(400).json({ success: false, message: "Invalid IDs provided" });
      return;
    }

    const result = await this.teamService.removeMember(teamId, requesterId, targetUserId);
    
    if (!result.success) {
      res.status(result.statusCode || 400).json({ success: false, message: result.error });
      return;
    }

    res.status(200).json({ success: true, message: "Member removed successfully" });
  }

  public getRouter(): Router {
    return this.router;
  }
}