import { NextFunction, Request, Response } from "express";
import axios from "axios";
import { env } from "../config/env";
import { UserPayload } from "../../index";
import { logger } from "../config/logger";

export const tokenVerifier = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        message: "Authorization token was not provided",
        isSuccess: false,
      });
      return;
    }

    const response = await axios.get(
      `${env.AUTH_SERVICE_URL}/auth/verify-user`,
      {
        headers: { Authorization: authHeader },
      },
    );

    if (response.data && response.data.isSuccess) {
      req.user = response.data.user as UserPayload;
      next();
    } else {
      res.status(401).json({ isSuccess: false, message: "Invalid token" });
    }
  } catch (err: any) {
    logger.error("Auth delegation failed", { error: err.message });
    const status = err.response?.status || 401;
    res.status(status).json({
      isSuccess: false,
      message: err.response?.data?.message || "Authentication failed",
    });
  }
};
