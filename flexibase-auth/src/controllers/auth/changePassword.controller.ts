import { Request, Response } from "express";
import { authService } from "../../services";
import { AppError } from "../../utils/AppError";

export const changePasswordController = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError("Unauthorized", 401);

  const { oldPassword, newPassword } = req.body;

  await authService.changePassword(userId, oldPassword, newPassword);

  res.json({ isSuccess: true, message: "Password changed successfully" });
};
