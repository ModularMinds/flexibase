import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { logger } from "../config/logger";

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

      res.status(200).json({
        isSuccess: true,
        message: `Table '${tableName}' admin-only status updated to ${isAdminOnly}.`,
      });
      return;
    }

    if (alterQuery) {
      await prisma.$executeRawUnsafe(alterQuery);
    }

    res.status(200).json({
      isSuccess: true,
      message: `Table '${tableName}' altered successfully: ${action} column '${column.name}'.`,
    });
  } catch (err: any) {
    logger.error("Error altering table:", err);
    next(err);
  }
};
