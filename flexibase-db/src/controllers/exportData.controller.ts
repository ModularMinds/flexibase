import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { logger } from "../config/logger";
import { logAudit } from "../utils/auditLogger";
import { validateTableAccess } from "../utils/accessControl";
import { Parser } from "json2csv";
import { Readable } from "stream";

export const exportDataController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { tableName, format } = req.query as any;

  if (!tableName) {
    res
      .status(400)
      .json({ isSuccess: false, message: "Table name is required." });
    return;
  }

  const exportFormat = (format || "json").toLowerCase();
  const user = (req as any).user;

  try {
    // Check access
    await validateTableAccess(tableName, user.role);

    const quotedTableName = `"${tableName.replace(/"/g, '""')}"`;
    // We could stream directly from DB to response, but Prisma's raw query returns full array.
    // For true streaming we'd need a cursor or native driver stream.
    // For now we will fetch all (memory bounded by Node per request) or implement pagination.
    // Let's just fetch all for "Export" as usually requested, but warn on large tables.
    // A better approach for huge tables is `COPY TO STDOUT` but that requires specific driver access.
    // We'll stick to simple fetch for now as per "MVP/Pre-release" scope unless user requested robust streaming.
    // The plan mentioned "Stream convert -> Pipe".
    // We can simulate streaming by fetching in batches if needed, but json2csv can parse object array.

    // Let's fetch all data.
    const records: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM ${quotedTableName}`,
    );

    // Audit Log
    if (user) {
      await logAudit(user.id, "EXPORT_DATA", tableName, undefined, {
        format: exportFormat,
        recordCount: records.length,
      });
    }

    if (exportFormat === "csv") {
      if (records.length === 0) {
        res.header("Content-Type", "text/csv");
        res.attachment(`${tableName}.csv`);
        res.send("");
        return;
      }
      const json2csvParser = new Parser();
      const csv = json2csvParser.parse(records);

      res.header("Content-Type", "text/csv");
      res.attachment(`${tableName}.csv`);
      res.send(csv);
    } else {
      res.header("Content-Type", "application/json");
      res.attachment(`${tableName}.json`);
      res.json(records);
    }
  } catch (err: any) {
    logger.error("Error exporting data:", err);
    next(err);
  }
};
