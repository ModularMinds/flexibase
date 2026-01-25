import { Request, Response } from "express";
import { userService } from "../../services";
import { AppError } from "../../utils/AppError";

export const getMeController = async (req: Request, res: Response) => {
  // req.user is set by tokenVerifier, but we might want fresh data from DB
  const userId = req.user?.id;
  if (!userId) throw new AppError("Unauthorized", 401);

  const user = await userService.findUserById(userId);
  if (!user) throw new AppError("User not found", 404);

  // Exclude password
  const { password, ...userWithoutPassword } = user;

  res.json({ isSuccess: true, user: userWithoutPassword });
};

export const updateMeController = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError("Unauthorized", 401);

  const { name, bio, avatarUrl } = req.body;

  const updatedUser = await userService.updateUser(userId, {
    name,
    bio,
    avatarUrl,
  });

  const { password, ...userWithoutPassword } = updatedUser;

  res.json({ isSuccess: true, user: userWithoutPassword });
};
