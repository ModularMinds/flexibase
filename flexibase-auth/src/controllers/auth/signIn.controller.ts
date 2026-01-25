import { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import { compare } from "bcrypt";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../services/token.service";

import { AppError } from "../../utils/AppError";

export const signInController = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new AppError("invalid credentials", 401);
  }

  const isPasswordMatch = await compare(password, user.password);

  if (!isPasswordMatch) {
    throw new AppError("invalid credentials", 401);
  }

  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = await generateRefreshToken(user.id);

  res.json({
    message: "User logged in successfully",
    isSuccess: true,
    accessToken,
    refreshToken,
  });
};
