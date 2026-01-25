import { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../services/token.service";

export const signUpController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Note: Password hashing should be added here
    const user = await prisma.user.create({
      data: {
        email,
        password,
      },
    });

    const accessToken = generateAccessToken(user.id, "USER");
    const refreshToken = await generateRefreshToken(user.id);

    res.status(201).json({
      message: "user created successfully",
      isSuccess: true,
      accessToken,
      refreshToken,
    });
  } catch (err: any) {
    res.status(500).json({ err: err.message, isSuccess: false });
  }
};
