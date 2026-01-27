import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { logger } from "../config/logger";
import { logAudit } from "../utils/auditLogger";
import { triggerWebhooks } from "../utils/webhookTrigger";
import { cacheService } from "../services/cache.service";

export const alterTableController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { tableName, action, column } = req.body;

  try {
    const quotedTableName = `"${tableName.replace(/"/g, '""')}"`;
    const quotedColumnName = `"${column.name.replace(/"/g, '""')}"`;

    let alterQuery = "";

    if (action === "ADD") {
      if (!column.type) {
        res.status(400).json({
          isSuccess: false,
          message: "Column type is required for ADD action.",
        });
        return;
      }
      alterQuery = `ALTER TABLE ${quotedTableName} ADD COLUMN ${quotedColumnName} ${column.type} ${column.constraints || ""}`;
    } else if (action === "DROP") {
      alterQuery = `ALTER TABLE ${quotedTableName} DROP COLUMN ${quotedColumnName}`;
    } else if (action === "TOGGLE_ADMIN_ONLY") {
      const { isAdminOnly } = req.body;
      const updateMetadataQuery = `
        INSERT INTO "_flexibase_table_metadata" (tablename, is_admin_only)
        VALUES ($1, $2)
        ON CONFLICT (tablename) DO UPDATE SET is_admin_only = EXCLUDED.is_admin_only
      `;
      await prisma.$executeRawUnsafe(
        updateMetadataQuery,
        tableName,
        isAdminOnly,
      );

      const user = (req as any).user;
      if (user) {
        await logAudit(user.id, "ALTER_TABLE_ACCESS", tableName, undefined, {
          isAdminOnly,
        });
      }

      res.status(200).json({
        isSuccess: true,
        message: `Table '${tableName}' admin-only status updated to ${isAdminOnly}.`,
      });
      return;
    }

    if (alterQuery) {
      await prisma.$executeRawUnsafe(alterQuery);
      // Audit Log
      const user = (req as any).user;
      if (user) {
        await logAudit(user.id, "ALTER_TABLE", tableName, undefined, {
          rawParams: req.body,
        });
      }

      // Trigger Webhooks
      triggerWebhooks("ALTER_TABLE", {
        tableName,
        action,
        column: req.body.column,
      });

      // Invalidate Cache
      await cacheService.invalidatePattern(`columns:${tableName}`);
      await cacheService.invalidatePattern(`data:${tableName}:*`);

      res.status(200).json({
        isSuccess: true,
        message: `Table '${tableName}' altered successfully.`,
      });
    } else {
      // If alterQuery is empty, it means no recognized action was performed.
      // This case should ideally be caught earlier by validation, but as a fallback:
      res.status(400).json({
        isSuccess: false,
        message: "Invalid or unsupported alter table action.",
      });
    }
  } catch (err: any) {
    logger.error("Error altering table:", err);
    next(err);
  }
};
