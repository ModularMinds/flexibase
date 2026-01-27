import { NextFunction, Request, Response } from "express";
import { logger } from "../config/logger";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.error(err.stack || err.message);

  const status = err.status || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({
    isSuccess: false,
    message,
  });
};
