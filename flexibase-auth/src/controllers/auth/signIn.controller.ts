import { Request, Response } from "express";
import {
  authService,
  generateAccessToken,
  generateRefreshToken,
} from "../../services";

export const signInController = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await authService.verifyCredentials(email, password);

  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = await generateRefreshToken(user.id);

  res.json({
    message: "User logged in successfully",
    isSuccess: true,
    accessToken,
    refreshToken,
  });
};
