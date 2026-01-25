import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { logger } from "../config/logger";
import { validateTableAccess } from "../utils/accessControl";

export const updateDataController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { tableName, data, conditions } = req.body;
  const user = (req as any).user;

  try {
    // Check table level access
    await validateTableAccess(tableName, user.role);

    // identifier quoting
    const quotedTableName = `"${tableName.replace(/"/g, '""')}"`;

    const setKeys = Object.keys(data);
    const setValues = Object.values(data);
    const conditionKeys = Object.keys(conditions);
    const conditionValues = Object.values(conditions);

    const setClauses = setKeys
      .map((key, index) => `"${key.replace(/"/g, '""')}" = $${index + 1}`)
      .join(", ");

    const conditionClauses = conditionKeys
      .map(
        (key, index) =>
          `"${key.replace(/"/g, '""')}" = $${setKeys.length + index + 1}`,
      )
      .join(" AND ");

    const updateQuery = `UPDATE ${quotedTableName} SET ${setClauses} WHERE ${conditionClauses}`;
    const allValues = [...setValues, ...conditionValues];

    const result = await prisma.$executeRawUnsafe(updateQuery, ...allValues);

    res.status(200).json({
      isSuccess: true,
      message: `Updated ${result} row(s) in table '${tableName}'.`,
    });
  } catch (err: any) {
    logger.error("Error updating data:", err);
    next(err);
  }
};
