import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { logger } from "../config/logger";
import { validateTableAccess } from "../utils/accessControl";
import { logAudit } from "../utils/auditLogger";
import { triggerWebhooks } from "../utils/webhookTrigger";

export const deleteDataController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { tableName, conditions } = req.body;
  const user = (req as any).user;

  try {
    // Check table level access
    await validateTableAccess(tableName, user.role);

    const quotedTableName = `"${tableName.replace(/"/g, '""')}"`;
    const conditionKeys = Object.keys(conditions);
    const conditionValues = Object.values(conditions);

    const conditionClauses = conditionKeys
      .map((key, index) => `"${key.replace(/"/g, '""')}" = $${index + 1}`)
      .join(" AND ");

    const deleteQuery = `DELETE FROM ${quotedTableName} WHERE ${conditionClauses}`;

    const result = await prisma.$executeRawUnsafe(
      deleteQuery,
      ...conditionValues,
    );

    // Audit Log
    if (user) {
      await logAudit(user.id, "DELETE", tableName, undefined, {
        conditions,
      });
    }

    // Trigger Webhooks
    triggerWebhooks("DELETE", { tableName, conditions });

    res.status(200).json({
      isSuccess: true,
      message: `Deleted ${result} row(s) from table '${tableName}'.`,
    });
  } catch (err: any) {
    logger.error("Error deleting data:", err);
    next(err);
  }
};
