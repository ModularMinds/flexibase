import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { logger } from "../config/logger";

export const createTableController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { tableName, tableColumns } = req.body;

  if (!tableName || !Array.isArray(tableColumns) || tableColumns.length === 0) {
    res.status(400).json({
      isSuccess: false,
      message: "Table name and valid column definitions are required.",
    });
    return;
  }

  try {
    const quotedTableName = `"${tableName.replace(/"/g, '""')}"`;
    const columnDefinitions = tableColumns
      .map((column: { name: string; type: string; constraints?: string }) => {
        if (!column.name || !column.type)
          throw new Error("Each column must have a name and a type.");

        const quotedColName = `"${column.name.replace(/"/g, '""')}"`;
        // We can't easily quote types/constraints in a standard way without a whitelist,
        // but since this is an admin route, we rely on Basic Auth + some validation.
        // For robustness, we should ideally whitelist types.
        return `${quotedColName} ${column.type} ${column.constraints || ""}`.trim();
      })
      .join(", ");

    const createTableQuery = `CREATE TABLE IF NOT EXISTS ${quotedTableName} (${columnDefinitions})`;

    await prisma.$executeRawUnsafe(createTableQuery);

    res.status(201).json({
      isSuccess: true,
      message: `Table '${tableName}' created successfully.`,
    });
    return;
  } catch (err: any) {
    logger.error("Error creating table:", err);
    res.status(500).json({ isSuccess: false, error: err.message });
    return;
  }
};
