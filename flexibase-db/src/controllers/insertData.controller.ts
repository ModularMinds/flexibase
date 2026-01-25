import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { logger } from "../config/logger";
import { validateTableAccess } from "../utils/accessControl";

export const insertDataController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { tableName, data } = req.body;
  const user = (req as any).user;

  try {
    // Check table level access
    await validateTableAccess(tableName, user.role);

    const quotedTableName = `"${tableName.replace(/"/g, '""')}"`;
    const keys = Object.keys(data);
    const values = Object.values(data);

    const quotedColumns = keys
      .map((key) => `"${key.replace(/"/g, '""')}"`)
      .join(", ");
    const placeholders = values.map((_, index) => `$${index + 1}`).join(", ");

    const insertQuery = `INSERT INTO ${quotedTableName} (${quotedColumns}) VALUES (${placeholders})`;

    await prisma.$executeRawUnsafe(insertQuery, ...values);

    res.status(201).json({
      isSuccess: true,
      message: `Data inserted into table '${tableName}' successfully.`,
    });
  } catch (err: any) {
    logger.error("Error inserting data:", err);
    next(err);
  }
};
