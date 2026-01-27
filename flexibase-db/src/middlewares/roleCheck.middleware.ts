import { NextFunction, Request, Response } from "express";

export const roleCheck = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ isSuccess: false, message: "Unauthorized" });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        isSuccess: false,
        message: `Forbidden: requires one of the following roles: ${roles.join(", ")}`,
      });
      return;
    }

    next();
  };
};
