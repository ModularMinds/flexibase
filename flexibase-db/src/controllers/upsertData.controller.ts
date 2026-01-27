import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { logger } from "../config/logger";
import { validateTableAccess } from "../utils/accessControl";
import { logAudit } from "../utils/auditLogger";

export const upsertDataController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { tableName, data, conflictColumns } = req.body;
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

    const quotedConflictColumns = conflictColumns
      .map((col: string) => `"${col.replace(/"/g, '""')}"`)
      .join(", ");

    const updateClauses = keys
      .map(
        (key) =>
          `"${key.replace(/"/g, '""')}" = EXCLUDED."${key.replace(/"/g, '""')}"`,
      )
      .join(", ");

    const upsertQuery = `
      INSERT INTO ${quotedTableName} (${quotedColumns}) 
      VALUES (${placeholders}) 
      ON CONFLICT (${quotedConflictColumns}) 
      DO UPDATE SET ${updateClauses}
    `;

    await prisma.$executeRawUnsafe(upsertQuery, ...values);

    // Audit Log
    if (user) {
      await logAudit(user.id, "UPSERT", tableName, undefined, {
        conflictColumns,
        // data: data // Optional
      });
    }

    res.status(200).json({
      isSuccess: true,
      message: `Data upserted into table '${tableName}' successfully.`,
    });
  } catch (err: any) {
    logger.error("Error upserting data:", err);
    next(err);
  }
};
