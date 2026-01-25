import { Request, Response } from "express";
import {
  generateAccessToken,
  verifyRefreshToken,
  revokeRefreshToken,
  generateRefreshToken,
} from "../../services/token.service";
import { prisma } from "../../config/prisma";

export const refreshTokenController = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res
        .status(400)
        .json({ err: "Refresh token is required", isSuccess: false });
      return;
    }

    const payload = await verifyRefreshToken(refreshToken);

    if (!payload) {
      res
        .status(401)
        .json({ err: "Invalid or expired refresh token", isSuccess: false });
      return;
    }

    // Optional: Rotate refresh token (revoke old, issue new)
    // For tighter security, let's rotate it.
    await revokeRefreshToken(payload.tokenId);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      res.status(401).json({ err: "User not found", isSuccess: false });
      return;
    }

    const newRefreshToken = await generateRefreshToken(payload.userId);
    const newAccessToken = generateAccessToken(payload.userId, user.role);

    res.json({
      message: "Token refreshed successfully",
      isSuccess: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err: any) {
    res.status(500).json({ err: err.message, isSuccess: false });
  }
};
