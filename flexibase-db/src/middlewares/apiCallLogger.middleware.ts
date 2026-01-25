import { NextFunction, Request, Response } from "express";
import { logger } from "../config/logger";

export const apiCallLogger = (
  req: Request,
  _: Response,
  next: NextFunction,
) => {
  const requestId = req.headers["x-request-id"];
  logger.info(`${req.method} ${req.url}`, { requestId });
  next();
};
