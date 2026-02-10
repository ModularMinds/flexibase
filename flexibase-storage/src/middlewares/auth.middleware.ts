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
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next(); // Proceed without user context
    }

    // Call Auth Service to verify token
    const response = await axios.get(
      `${env.AUTH_SERVICE_URL}/auth/verify-user`,
      {
        headers: { Authorization: authHeader },
      },
    );

    if (response.data && response.data.isSuccess) {
      (req as any).user = response.data.user;
    }
    next();
  } catch (err: any) {
    // If token is present but invalid, we might still want to proceed as guest?
    // Usually if a token is provided and it's invalid, we should error.
    // If token is missing, we proceed as guest.
    logger.error("Optional auth delegation failed: " + err.message);
    next(); // Proceed as guest even on error if it's optional
  }
};
