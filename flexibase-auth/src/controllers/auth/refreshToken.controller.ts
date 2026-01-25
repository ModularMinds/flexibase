import { Request, Response } from "express";
import {
  generateAccessToken,
  verifyRefreshToken,
  revokeRefreshToken,
  generateRefreshToken,
} from "../../services/token.service";
import { AppError } from "../../utils/AppError";

export const refreshTokenController = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AppError("Refresh token is required", 400);
  }

  const result = await verifyRefreshToken(refreshToken);

  if (!result) {
    throw new AppError("Invalid refresh token", 401);
  }

  // Revoke the old refresh token (Rotation)
  await revokeRefreshToken(result.tokenId);

  // Generate new tokens
  const newAccessToken = generateAccessToken(result.userId, "USER");
  const newRefreshToken = await generateRefreshToken(result.userId);

  res.json({
    isSuccess: true,
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  });
};
