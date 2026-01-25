import { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import { compare } from "bcrypt";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../services/token.service";

export const signInController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({ err: "invalid credentials", isSuccess: false });
      return;
    }

    const isPasswordMatch = await compare(password, user.password);

    if (!isPasswordMatch) {
      res.status(401).json({ err: "invalid credentials", isSuccess: false });
      return;
    }

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = await generateRefreshToken(user.id);

    res.json({
      message: "login success",
      accessToken,
      refreshToken,
      isSuccess: true,
    });
  } catch (err) {
    res.status(500).json({ err, isSuccess: false });
  }
};
