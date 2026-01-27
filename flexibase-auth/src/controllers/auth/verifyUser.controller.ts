import { Request, Response } from "express";
import { AppError } from "../../utils/AppError";

export const verifyUserController = (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401);
  }
  const { id, role } = req.user;

  res.json({
    isSuccess: true,
    user: { id, role },
  });
};
