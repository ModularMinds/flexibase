import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { logger } from "../config/logger";

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

export const fetchDataController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { tableName, columns, filters, sort, limit, offset } = req.body;

  try {
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
      const filterClauses = filters.map((filter) => {
        const { column, operator, value } = filter;
        const quotedCol = `"${column.replace(/"/g, '""')}"`;
        const sqlOp = OPERATOR_MAP[operator];

        if (operator === "in") {
          if (!Array.isArray(value)) {
            throw new Error(
              `Value for 'in' operator must be an array: ${column}`,
            );
          }
          // PostgreSQL IN ($1, $2, ...)
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

    res.status(200).json({
      isSuccess: true,
      data: results,
    });
  } catch (err: any) {
    logger.error("Error fetching data with advanced query:", err);
    next(err);
  }
};
