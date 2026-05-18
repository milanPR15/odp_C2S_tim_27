import { Request, Response, Router } from "express";
import { IUserService } from "../../Domain/services/users/IUserService";
import { UpdateProfileDto } from "../../Domain/DTOs/account/UpdateProfileDto";
import { authenticate } from "../../Middlewares/authentification/AuthMiddleware";

export class UserController {
  private readonly router = Router();

  constructor(private readonly userService: IUserService) {
    this.router.put("/users/profile", authenticate, this.updateProfile);
    this.router.get("/users/profile", authenticate, this.getCurrentProfile);
  }

  updateProfile = async (req: Request, res: Response) => {
    const userId = (req.user as { id: number }).id;

    const dto = new UpdateProfileDto(
      req.body.gamer_tag,
      req.body.full_name,
      req.body.email,
      req.body.password,
      req.body.profile_image
    );

    const result = await this.userService.updateProfile(userId, dto);

    if (!result.success) {
      res.status(result.statusCode).json({ success: false, error: result.error });
      return;
    }

    res.status(200).json(result);
  };

  getCurrentProfile = async (req: Request, res: Response) => {

  const userId = (req.user as { id: number }).id;

  const user = await this.userService.getCurrentProfile(userId);

  if (!user) {

    res.status(404).json({success: false, error: "User not found"});

    return;
  }

  res.status(200).json({success: true, data: user});
};

  getRouter() {
    return this.router;
  }
}