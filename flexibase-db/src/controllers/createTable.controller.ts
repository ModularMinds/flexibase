import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { logger } from "../config/logger";
import { logAudit } from "../utils/auditLogger";

const POSTGRES_TYPES_WHITELIST = [
  "SERIAL",
  "SMALLSERIAL",
  "BIGSERIAL",
  "INTEGER",
  "BIGINT",
  "SMALLINT",
  "DECIMAL",
  "NUMERIC",
  "REAL",
  "DOUBLE PRECISION",
  "BOOLEAN",
  "CHAR",
  "VARCHAR",
  "TEXT",
  "DATE",
  "TIMESTAMP",
  "TIMESTAMPTZ",
  "JSON",
  "JSONB",
  "UUID",
];

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

        // Type safety: Whitelist check
        const baseType = column.type.split("(")[0].toUpperCase().trim();
        if (!POSTGRES_TYPES_WHITELIST.includes(baseType)) {
          throw new Error(`Unsupported or unsafe column type: ${column.type}`);
        }

        return `${quotedColName} ${column.type} ${column.constraints || ""}`.trim();
      })
      .join(", ");

    const createTableQuery = `CREATE TABLE IF NOT EXISTS ${quotedTableName} (${columnDefinitions})`;

    await prisma.$executeRawUnsafe(createTableQuery);

    // Store metadata
    const { isAdminOnly } = req.body;
    const insertMetadataQuery = `
      INSERT INTO "_flexibase_table_metadata" (tablename, is_admin_only)
      VALUES ($1, $2)
      ON CONFLICT (tablename) DO UPDATE SET is_admin_only = EXCLUDED.is_admin_only
    `;
    await prisma.$executeRawUnsafe(
      insertMetadataQuery,
      tableName,
      isAdminOnly || false,
    );

    // Audit Log
    const user = (req as any).user;
    if (user) {
      await logAudit(user.id, "CREATE_TABLE", tableName, undefined, {
        columns: tableColumns,
        isAdminOnly,
      });
    }

    res.status(201).json({
      isSuccess: true,
      message: `Table '${tableName}' created successfully.`,
    });
    return;
  } catch (err: any) {
    logger.error("Error creating table:", err);
    next(err);
    return;
  }
};
