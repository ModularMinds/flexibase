import { NextFunction, Request, Response } from "express";
import { JwtPayload, verify } from "jsonwebtoken";

export const tokenVerifier = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        err: "authorization token was not provided",
        isSuccess: false,
      });
      return;
    }

    const token = authHeader!.split(" ")[1];

    req.user = verify(
      token,
      process.env.FLEXIBASE_AUTH_SECRET_KEY!,
    ) as JwtPayload;

    next();
  } catch (err) {
    res.status(401).json({ isSucess: false, err: "Invalid token" });
  }
};
