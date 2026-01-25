import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { logger } from "../config/logger";

export const getAllTablesController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const query = `SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'`;

  try {
    const results: any[] = await prisma.$queryRawUnsafe(query);
    const tables = results.map((row: any) => row.tablename);

    res.status(200).json({
      isSuccess: true,
      tables,
    });
    return;
  } catch (err: any) {
    logger.error("Error fetching tables:", err);
    next(err);
    return;
  }
};
