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
    this.router.get("/", authenticate, this.getMyTeams.bind(this));
    this.router.post("/", authenticate, this.createTeam.bind(this));
    this.router.get("/:id", this.getTeamById.bind(this));

    // Captain / članovi rute (za sada nedovršene)
    this.router.put("/:id", authenticate, this.updateTeam.bind(this));
    this.router.delete("/:id", authenticate, this.deleteTeam.bind(this));

    this.router.post("/:id/invite", authenticate, this.sendInvite.bind(this));
    this.router.post("/:id/invite/respond", authenticate, this.respondToInvite.bind(this));

    this.router.patch("/:id/members/:userId/role", authenticate, this.transferCaptain.bind(this));
    this.router.delete("/:id/members/:userId", authenticate, this.removeMember.bind(this));
  }

  private async getMyTeams(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const teams = await this.teamService.getMyTeams(userId);
    res.status(200).json({ success: true, data: teams });
  }

  private async createTeam(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const dto = new CreateTeamDto(
      req.body.team_name,
      req.body.tag,
      req.body.logo || "",
      req.body.description || null
    );

    try {
      const team = await this.teamService.createTeam(userId, dto);
      res.status(201).json({ success: true, data: team });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || "Failed to create team" });
    }
  }

  private async getTeamById(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: "Invalid team ID" });
      return;
    }

    const team = await this.teamService.getTeamById(id);
    if (!team) {
      res.status(404).json({ success: false, message: "Team not found" });
      return;
    }

    res.status(200).json({ success: true, data: team });
  }

  // Ostale metode za sada ostavljamo kao "Not implemented"
  private async updateTeam(req: Request, res: Response): Promise<void> {
    res.status(501).json({ success: false, message: "Not implemented yet" });
  }

  private async deleteTeam(req: Request, res: Response): Promise<void> {
    res.status(501).json({ success: false, message: "Not implemented yet" });
  }

  private async sendInvite(req: Request, res: Response): Promise<void> {
    res.status(501).json({ success: false, message: "Not implemented yet" });
  }

  private async respondToInvite(req: Request, res: Response): Promise<void> {
    res.status(501).json({ success: false, message: "Not implemented yet" });
  }

  private async transferCaptain(req: Request, res: Response): Promise<void> {
    res.status(501).json({ success: false, message: "Not implemented yet" });
  }

  private async removeMember(req: Request, res: Response): Promise<void> {
    res.status(501).json({ success: false, message: "Not implemented yet" });
  }

  public getRouter(): Router {
    return this.router;
  }
}