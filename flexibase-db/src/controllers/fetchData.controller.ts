import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { logger } from "../config/logger";

export const fetchDataController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { tableName, conditions } = req.body;

  if (!tableName) {
    res.status(400).json({
      isSuccess: false,
      message: "Table name is required.",
    });
    return;
  }

  // Quote identifier to prevent SQL injection
  const quotedTableName = `"${tableName.replace(/"/g, '""')}"`;

  let query = `SELECT * FROM ${quotedTableName}`;
  const values: any[] = [];

  if (
    conditions &&
    typeof conditions === "object" &&
    !Array.isArray(conditions)
  ) {
    const conditionKeys = Object.keys(conditions);
    if (conditionKeys.length > 0) {
      const conditionClauses = conditionKeys
        .map((key, index) => {
          values.push(conditions[key]);
          const quotedCol = `"${key.replace(/"/g, '""')}"`;
          return `${quotedCol} = $${index + 1}`;
        })
        .join(" AND ");
      query += ` WHERE ${conditionClauses}`;
    }
  }

  try {
    const results = await prisma.$queryRawUnsafe(query, ...values);

    res.status(200).json({
      isSuccess: true,
      data: results,
    });
    return;
  } catch (err: any) {
    logger.error("Error fetching data:", err);
    next(err);
    return;
  }
};
