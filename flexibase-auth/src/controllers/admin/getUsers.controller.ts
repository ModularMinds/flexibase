import { Request, Response } from "express";
import { prisma } from "../../config/prisma";

export const getUsersController = async (_: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
      },
    });

    res.json({ isSuccess: true, users });
  } catch (err: any) {
    res.status(500).json({ err: err.message, isSuccess: false });
  }
};
