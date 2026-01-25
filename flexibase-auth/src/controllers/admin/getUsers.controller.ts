import { Request, Response } from "express";
import { prisma } from "../../config/prisma";

export const getUsersController = async (req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      // createdAt: true,
      // updatedAt: true,
    },
  });

  res.json({ isSuccess: true, users });
};
