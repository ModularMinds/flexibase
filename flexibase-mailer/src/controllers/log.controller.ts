import { Request, Response, NextFunction } from "express";
import prisma from "../db/client";

export const getLogsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.emailLog.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          events: true, // Include related events (opens, clicks)
        },
      }),
      prisma.emailLog.count(),
    ]);

    res.status(200).json({
      isSuccess: true,
      data: {
        logs,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    next(err);
  }
};
