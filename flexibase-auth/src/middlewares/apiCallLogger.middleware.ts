import { NextFunction, Request, Response } from "express";
import { logger } from "../config/logger";

export const apiCallLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.info(`Incoming Request: [${req.method}] ${req.url}`);
  next();
};
