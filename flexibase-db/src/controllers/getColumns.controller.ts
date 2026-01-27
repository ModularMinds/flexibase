import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { logger } from "../config/logger";

import { cacheService } from "../services/cache.service";

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

  // ...

  try {
    // Cache Check
    const cacheKey = `columns:${tableName}`;
    const cachedColumns = await cacheService.get(cacheKey);
    if (cachedColumns) {
      res.status(200).json({
        isSuccess: true,
        columns: cachedColumns,
        source: "cache",
      });
      return;
    }

    const results: any[] = await prisma.$queryRawUnsafe(query, tableName);

    if (results.length === 0) {
      res.status(404).json({
        isSuccess: false,
        message: `Table '${tableName}' not found.`,
      });
      return;
    }

    const columns = results.map((row: any) => row.column_name);

    // Set Cache
    await cacheService.set(cacheKey, columns, 300);

    res.status(200).json({
      isSuccess: true,
      columns: columns,
      source: "database",
    });
    return;
  } catch (err: any) {
    logger.error("Error retrieving columns:", err);
    next(err);
    return;
  }
};
