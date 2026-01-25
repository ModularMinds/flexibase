import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";

export const requestId = (req: Request, res: Response, next: NextFunction) => {
  const headerName = "X-Request-Id";
  const oldValue = req.get(headerName);

  const id = oldValue === undefined ? uuidv4() : oldValue;

  req.id = id;
  res.set(headerName, id);

  next();
};
