import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { logger } from "../config/logger";

export const createIndexController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { tableName, indexName, columns, unique } = req.body;

  try {
    const quotedTableName = `"${tableName.replace(/"/g, '""')}"`;
    const quotedIndexName = `"${indexName.replace(/"/g, '""')}"`;
    const quotedColumns = columns
      .map((col: string) => `"${col.replace(/"/g, '""')}"`)
      .join(", ");

    const createIndexQuery = `${unique ? "CREATE UNIQUE INDEX" : "CREATE INDEX"} ${quotedIndexName} ON ${quotedTableName} (${quotedColumns})`;

    await prisma.$executeRawUnsafe(createIndexQuery);

    res.status(201).json({
      isSuccess: true,
      message: `Index '${indexName}' created successfully on table '${tableName}'.`,
    });
  } catch (err: any) {
    logger.error("Error creating index:", err);
    next(err);
  }
};
