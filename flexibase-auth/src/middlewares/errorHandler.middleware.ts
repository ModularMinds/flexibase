import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      isSuccess: false,
      err: err.message,
    });
    return;
  }

  console.error("Unhandled Error:", err);

  res.status(500).json({
    isSuccess: false,
    err: "Internal Server Error",
  });
};
