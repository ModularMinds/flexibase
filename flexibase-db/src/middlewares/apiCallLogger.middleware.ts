import { NextFunction, Request, Response } from "express";

export const apiCallLogger = (
  req: Request,
  _: Response,
  next: NextFunction
) => {
  console.log(`${req.method} ${req.url} ${new Date().toISOString()}`);
  next();
};
