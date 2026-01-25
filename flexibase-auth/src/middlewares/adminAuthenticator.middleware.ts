import { NextFunction, Request, Response } from "express";

export const adminAuthenticator = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // req.user is populated by tokenVerifier
    const user = req.user;

    if (!user || user.role !== "ADMIN") {
      res
        .status(403)
        .json({ err: "Access denied: Admins only", isSuccess: false });
      return;
    }

    next();
  } catch (err) {
    next(res.json({ isSuccess: false, err }));
  }
};
