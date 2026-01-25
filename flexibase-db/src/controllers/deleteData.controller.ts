import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { logger } from "../config/logger";

export const deleteDataController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { tableName, conditions } = req.body;

  const quotedTableName = `"${tableName.replace(/"/g, '""')}"`;
  const conditionKeys = Object.keys(conditions);
  const conditionValues = Object.values(conditions);

  const conditionClauses = conditionKeys
    .map((key, index) => `"${key.replace(/"/g, '""')}" = $${index + 1}`)
    .join(" AND ");

  const deleteQuery = `DELETE FROM ${quotedTableName} WHERE ${conditionClauses}`;

  try {
    const result = await prisma.$executeRawUnsafe(
      deleteQuery,
      ...conditionValues,
    );

    res.status(200).json({
      isSuccess: true,
      message: `Deleted ${result} row(s) from table '${tableName}'.`,
    });
  } catch (err: any) {
    logger.error("Error deleting data:", err);
    next(err);
  }
};
