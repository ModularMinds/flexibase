import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { logger } from "../config/logger";

export const deleteTableController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { tableName } = req.body;

  if (!tableName) {
    res.status(400).json({
      isSuccess: false,
      message: "Table name is required.",
    });
    return;
  }

  const quotedTableName = `"${tableName.replace(/"/g, '""')}"`;
  const deleteTableQuery = `DROP TABLE IF EXISTS ${quotedTableName}`;

  try {
    await prisma.$executeRawUnsafe(deleteTableQuery);

    res.status(200).json({
      isSuccess: true,
      message: `Table '${tableName}' deleted successfully.`,
    });
    return;
  } catch (err: any) {
    logger.error("Error deleting table:", err);
    res.status(500).json({
      isSuccess: false,
      error: err.message,
    });
    return;
  }
};
