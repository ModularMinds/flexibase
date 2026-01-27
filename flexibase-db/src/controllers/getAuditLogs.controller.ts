import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { logger } from "../config/logger";

export const getAuditLogsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { userId, tableName, action, startDate, endDate, limit, offset } =
    req.query as any;

  try {
    let query = `SELECT * FROM "_flexibase_audit_logs" WHERE 1=1`;
    const params: any[] = [];

    if (userId) {
      params.push(userId);
      query += ` AND user_id = $${params.length}`;
    }

    if (tableName) {
      params.push(tableName);
      query += ` AND table_name = $${params.length}`;
    }

    if (action) {
      params.push(action);
      query += ` AND action = $${params.length}`;
    }

    if (startDate) {
      params.push(startDate);
      query += ` AND timestamp >= $${params.length}`;
    }

    if (endDate) {
      params.push(endDate);
      query += ` AND timestamp <= $${params.length}`;
    }

    query += ` ORDER BY timestamp DESC`;

    if (limit) {
      // Prisma raw query params numbering continues
      params.push(Number(limit));
      query += ` LIMIT $${params.length}`;
    } else {
      query += ` LIMIT 100`; // Default limit
    }

    if (offset) {
      params.push(Number(offset));
      query += ` OFFSET $${params.length}`;
    }

    const logs = await prisma.$queryRawUnsafe(query, ...params);

    res.status(200).json({
      isSuccess: true,
      logs,
    });
  } catch (err: any) {
    logger.error("Error fetching audit logs:", err);
    next(err);
  }
};
