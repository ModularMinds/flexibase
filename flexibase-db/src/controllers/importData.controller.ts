import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { logger } from "../config/logger";
import { logAudit } from "../utils/auditLogger";
import { validateTableAccess } from "../utils/accessControl";
import { parse } from "csv-parse";
import { Readable } from "stream";

export const importDataController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { tableName } = req.body;
  const file = req.file;

  if (!file) {
    res.status(400).json({ isSuccess: false, message: "No file uploaded." });
    return;
  }

  if (!tableName) {
    res
      .status(400)
      .json({ isSuccess: false, message: "Table name is required." });
    return;
  }

  const user = (req as any).user;

  try {
    // Check access
    await validateTableAccess(tableName, user.role);

    const mimetype = file.mimetype;
    let records: any[] = [];

    if (
      mimetype === "application/json" ||
      file.originalname.endsWith(".json")
    ) {
      try {
        records = JSON.parse(file.buffer.toString("utf-8"));
        if (!Array.isArray(records)) {
          records = [records];
        }
      } catch (e) {
        res
          .status(400)
          .json({ isSuccess: false, message: "Invalid JSON format." });
        return;
      }
    } else if (mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
      records = await parseCsv(file.buffer);
    } else {
      res.status(400).json({
        isSuccess: false,
        message: "Unsupported file format. Please upload CSV or JSON.",
      });
      return;
    }

    if (records.length === 0) {
      res
        .status(200)
        .json({ isSuccess: true, message: "No records to import." });
      return;
    }

    // Prepare for bulk insert
    // We'll use a transaction if possible, or just bulk insert logic
    // Prisma $executeRawUnsafe for dynamic table names
    // Constructing values for bulk insert is tricky with raw SQL and varying columns
    // We assume all records have matching keys to the columns, or at least the first one defines structure

    const keys = Object.keys(records[0]);
    const quotedColumns = keys
      .map((k) => `"${k.replace(/"/g, '""')}"`)
      .join(", ");
    const quotedTableName = `"${tableName.replace(/"/g, '""')}"`;

    // Process in chunks to avoid query param limits
    const CHUNK_SIZE = 500;
    let insertedCount = 0;

    for (let i = 0; i < records.length; i += CHUNK_SIZE) {
      const chunk = records.slice(i, i + CHUNK_SIZE);
      const values: any[] = [];
      const rowPlaceholders: string[] = [];

      let paramIndex = 1;
      chunk.forEach((record: any) => {
        const rowParams: string[] = [];
        keys.forEach((key) => {
          values.push(record[key]);
          rowParams.push(`$${paramIndex++}`);
        });
        rowPlaceholders.push(`(${rowParams.join(", ")})`);
      });

      const insertQuery = `
        INSERT INTO ${quotedTableName} (${quotedColumns})
        VALUES ${rowPlaceholders.join(", ")}
      `;

      await prisma.$executeRawUnsafe(insertQuery, ...values);
      insertedCount += chunk.length;
    }

    // Audit Log
    if (user) {
      await logAudit(user.id, "IMPORT_DATA", tableName, undefined, {
        recordCount: insertedCount,
        fileName: file.originalname,
      });
    }

    res.status(200).json({
      isSuccess: true,
      message: `Successfully imported ${insertedCount} records into '${tableName}'.`,
    });
  } catch (err: any) {
    logger.error("Error importing data:", err);
    next(err);
  }
};

const parseCsv = (buffer: Buffer): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const records: any[] = [];
    const stream = Readable.from(buffer);
    const parser = stream.pipe(
      parse({
        columns: true,
        skip_empty_lines: true,
      }),
    );

    parser.on("readable", () => {
      let record;
      while ((record = parser.read()) !== null) {
        records.push(record);
      }
    });

    parser.on("error", (err) => {
      reject(err);
    });

    parser.on("end", () => {
      resolve(records);
    });
  });
};
