import { Request, Response } from "express";
import {
  generateAccessToken,
  generateRefreshToken,
  userService,
} from "../../services";

export const signUpController = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await userService.createUser({
    email,
    password,
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
