import { NextFunction, Request, Response } from "express";
import { logger } from "../config/logger";

export const apiCallLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const requestId = req.id || "unknown";
  logger.info(
    `Incoming Request: [${req.method}] ${req.url} [req-id:${requestId}]`,
  );
  next();
};
