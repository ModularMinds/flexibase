import { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import { genSalt, hash } from "bcrypt";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../services/token.service";

export const signUpController = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const salt = await genSalt(10);
  const hashedPassword = await hash(password, salt);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
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
};
