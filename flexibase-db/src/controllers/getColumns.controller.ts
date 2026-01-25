import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { logger } from "../config/logger";

export const getTableColumnsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { tableName } = req.query;

  if (!tableName || typeof tableName !== "string") {
    res.status(400).json({
      isSuccess: false,
      message: "Table name is required and should be a string.",
    });
    return;
  }

  const query = `
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = $1 AND table_schema = 'public'
  `;

  try {
    const results: any[] = await prisma.$queryRawUnsafe(query, tableName);

    if (results.length === 0) {
      res.status(404).json({
        isSuccess: false,
        message: `Table '${tableName}' not found.`,
      });
      return;
    }

    const columns = results.map((row: any) => row.column_name);

    res.status(200).json({
      isSuccess: true,
      columns: columns,
    });
    return;
  } catch (err: any) {
    logger.error("Error retrieving columns:", err);
    next(err);
    return;
  }
};
