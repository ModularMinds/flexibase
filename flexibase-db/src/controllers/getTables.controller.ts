import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { logger } from "../config/logger";

export const getAllTablesController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const user = (req as any).user;
  const isAdmin = user?.role === "ADMIN";

  let query = `
    SELECT t.tablename 
    FROM pg_catalog.pg_tables t
    LEFT JOIN "_flexibase_table_metadata" m ON t.tablename = m.tablename
    WHERE t.schemaname = 'public'
    AND t.tablename != '_flexibase_table_metadata'
  `;

  if (!isAdmin) {
    query += ` AND (m.is_admin_only IS NULL OR m.is_admin_only = FALSE)`;
  }

  try {
    const results: any[] = await prisma.$queryRawUnsafe(query);
    const tables = results.map((row: any) => row.tablename);

    res.status(200).json({
      isSuccess: true,
      tables,
    });
    return;
  } catch (err: any) {
    logger.error("Error fetching tables:", err);
    next(err);
    return;
  }
};
