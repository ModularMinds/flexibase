import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { logger } from "../config/logger";
import { validateTableAccess } from "../utils/accessControl";

const OPERATOR_MAP: Record<string, string> = {
  eq: "=",
  neq: "<>",
  gt: ">",
  gte: ">=",
  lt: "<",
  lte: "<=",
  like: "LIKE",
  in: "IN",
};

import crypto from "crypto";
import { cacheService } from "../services/cache.service";

// ... (existing imports)

export const fetchDataController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { tableName, columns, filters, sort, limit, offset } = req.body;
  const user = (req as any).user;

  try {
    // Check table level access
    await validateTableAccess(tableName, user.role);

    // Cache Check
    const queryHash = crypto
      .createHash("md5")
      .update(
        JSON.stringify({ tableName, columns, filters, sort, limit, offset }),
      )
      .digest("hex");
    const cacheKey = `data:${tableName}:${queryHash}`;

    const cachedResult = await cacheService.get(cacheKey);
    if (cachedResult) {
      res.status(200).json({
        isSuccess: true,
        data: cachedResult,
        source: "cache",
      });
      return;
    }

    // 1. SELECT clause (Projections)
    let selectClause = "*";
    if (Array.isArray(columns) && columns.length > 0) {
      selectClause = columns
        .map((col: string) => `"${col.replace(/"/g, '""')}"`)
        .join(", ");
    }

    // 2. FROM clause
    const quotedTableName = `"${tableName.replace(/"/g, '""')}"`;
    let query = `SELECT ${selectClause} FROM ${quotedTableName}`;
    const values: any[] = [];

    // 3. WHERE clause (Filters)
    if (Array.isArray(filters) && filters.length > 0) {
      const filterClauses = filters.map((filter: any) => {
        const { column, operator, value } = filter;
        const quotedCol = `"${column.replace(/"/g, '""')}"`;
        const sqlOp = OPERATOR_MAP[operator];

        if (operator === "in") {
          if (!Array.isArray(value)) {
            throw new Error(
              `Value for 'in' operator must be an array: ${column}`,
            );
          }
          const inPlaceholders = value
            .map((_, i) => `$${values.length + i + 1}`)
            .join(", ");
          values.push(...value);
          return `${quotedCol} IN (${inPlaceholders})`;
        } else {
          values.push(value);
          return `${quotedCol} ${sqlOp} $${values.length}`;
        }
      });

      query += ` WHERE ${filterClauses.join(" AND ")}`;
    }

    // 4. ORDER BY clause (Sorting)
    if (sort && sort.column) {
      const quotedSortCol = `"${sort.column.replace(/"/g, '""')}"`;
      const direction = (sort.direction || "asc").toUpperCase();
      query += ` ORDER BY ${quotedSortCol} ${direction === "DESC" ? "DESC" : "ASC"}`;
    }

    // 5. LIMIT & OFFSET clauses (Pagination)
    if (typeof limit === "number") {
      query += ` LIMIT ${limit}`;
    }
    if (typeof offset === "number") {
      query += ` OFFSET ${offset}`;
    }

    const results = await prisma.$queryRawUnsafe(query, ...values);

    // Set Cache
    await cacheService.set(cacheKey, results, 300); // 5 min TTL

    res.status(200).json({
      isSuccess: true,
      data: results,
      source: "database",
    });
  } catch (err: any) {
    logger.error("Error fetching data with advanced query:", err);
    next(err);
  }
};
