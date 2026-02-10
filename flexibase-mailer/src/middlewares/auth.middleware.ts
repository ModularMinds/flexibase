import { Request, Response, NextFunction } from "express";
import axios from "axios";
import { env } from "../config/env";
import { logger } from "../config/logger";

export const authDelegation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res
      .status(401)
      .json({ isSuccess: false, message: "Authorization header missing" });
    return;
  }

  try {
    const response = await axios.get(
      `${env.AUTH_SERVICE_URL}/api/auth/verify`,
      {
        headers: { Authorization: authHeader },
      },
    );

    if (response.data.isSuccess) {
      (req as any).user = response.data.user;
      next();
    } else {
      res.status(401).json({ isSuccess: false, message: "Unauthorized" });
    }
  } catch (error: any) {
    logger.error("Auth Delegation Error:", error.message);
    res
      .status(401)
      .json({ isSuccess: false, message: "Authentication failed" });
  }
};
