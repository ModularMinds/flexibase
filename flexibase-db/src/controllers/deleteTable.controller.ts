import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { logger } from "../config/logger";
import { logAudit } from "../utils/auditLogger";
import { triggerWebhooks } from "../utils/webhookTrigger";

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

    // Delete metadata
    const deleteMetadataQuery = `DELETE FROM "_flexibase_table_metadata" WHERE tablename = $1`;
    await prisma.$executeRawUnsafe(deleteMetadataQuery, tableName);

    // Audit Log
    const user = (req as any).user;
    if (user) {
      await logAudit(user.id, "DELETE_TABLE", tableName);
    }

    // Trigger Webhooks
    triggerWebhooks("DELETE_TABLE", { tableName });

    res.status(200).json({
      isSuccess: true,
      message: `Table '${tableName}' deleted successfully.`,
    });
    return;
  } catch (err: any) {
    logger.error("Error deleting table:", err);
    next(err);
    return;
  }
};
