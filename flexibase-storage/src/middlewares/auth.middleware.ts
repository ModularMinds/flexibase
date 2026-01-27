import { Request, Response, NextFunction } from "express";
import axios from "axios";
import { env } from "../config/env";
import { logger } from "../config/logger";

export const authDelegation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        isSuccess: false,
        message: "Authorization token was not provided",
      });
    }

    // Call Auth Service to verify token
    const response = await axios.get(
      `${env.AUTH_SERVICE_URL}/auth/verify-user`,
      {
        headers: { Authorization: authHeader },
      },
    );

    if (response.data && response.data.isSuccess) {
      // Attach user to request
      (req as any).user = response.data.user;
      next();
    } else {
      res.status(401).json({ isSuccess: false, message: "Invalid token" });
    }
  } catch (err: any) {
    logger.error("Auth delegation failed: " + err.message);
    const status = err.response?.status || 401;
    res.status(status).json({
      isSuccess: false,
      message: err.response?.data?.message || "Authentication failed",
    });
  }
};
