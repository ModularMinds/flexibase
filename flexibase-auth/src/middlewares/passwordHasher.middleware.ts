import { genSalt, hash } from "bcrypt";
import { NextFunction, Request, Response } from "express";

export const passwordHasher = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const salt = await genSalt(10);
    const hashedPassword = await hash(req.body.password, salt);

    req.body.password = hashedPassword;

    next();
  } catch (err) {
    next(JSON.stringify(res.json({ err })))
  }
};
