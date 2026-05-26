import { Router, Request, Response } from "express";
import { authenticate } from "../../Middlewares/authentification/AuthMiddleware";
import { IWatchlistService } from "../../Domain/services/watchlists/IWatchlistService";

export class WatchlistController {
  private readonly router = Router();

  constructor(private readonly watchlistService: IWatchlistService) {
    this.router.get("/watchlist", authenticate, this.getMine.bind(this));
    this.router.post("/watchlist/:tournamentId", authenticate, this.follow.bind(this));
    this.router.delete("/watchlist/:tournamentId", authenticate, this.unfollow.bind(this));
  }

  private async getMine(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id || 0;
    const result = await this.watchlistService.getForUser(userId);

    if (!result.success) {
      res.status(result.statusCode).json({ success: false, message: result.error });
      return;
    }

    res.status(200).json({ success: true, data: result.data });
  }

  private async follow(req: Request, res: Response): Promise<void> {
    const tournamentId = Number(req.params.tournamentId);
    if (Number.isNaN(tournamentId)) {
      res.status(400).json({ success: false, message: "Invalid tournament ID syntax" });
      return;
    }

    const result = await this.watchlistService.follow(req.user?.id || 0, tournamentId);
    if (!result.success) {
      res.status(result.statusCode).json({ success: false, message: result.error });
      return;
    }

    res.status(201).json({ success: true, message: "Tournament added to watchlist." });
  }

  private async unfollow(req: Request, res: Response): Promise<void> {
    const tournamentId = Number(req.params.tournamentId);
    if (Number.isNaN(tournamentId)) {
      res.status(400).json({ success: false, message: "Invalid tournament ID syntax" });
      return;
    }

    const result = await this.watchlistService.unfollow(req.user?.id || 0, tournamentId);
    if (!result.success) {
      res.status(result.statusCode).json({ success: false, message: result.error });
      return;
    }

    res.status(200).json({ success: true, message: "Tournament removed from watchlist." });
  }

  public getRouter(): Router {
    return this.router;
  }
}