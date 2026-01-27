import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { logger } from "../config/logger";
import { validateTableAccess } from "../utils/accessControl";
import { logAudit } from "../utils/auditLogger";
import { triggerWebhooks } from "../utils/webhookTrigger";

export const batchTransactionController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { operations } = req.body;
  const user = (req as any).user;

  try {
    // 1. Validate Access for all tables involved
    const uniqueTables = [
      ...new Set(operations.map((op: any) => op.tableName)),
    ];
    for (const tableName of uniqueTables) {
      await validateTableAccess(tableName as string, user.role);
    }

    const prismaPromises: any[] = [];
    const auditLogs: any[] = [];
    const webhooks: any[] = [];

    // 2. Build Promises
    for (const op of operations) {
      const { type, tableName, data, conditions } = op;
      const quotedTableName = `"${tableName.replace(/"/g, '""')}"`;

      if (type === "INSERT") {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const quotedColumns = keys
          .map((key) => `"${key.replace(/"/g, '""')}"`)
          .join(", ");
        const placeholders = values
          .map((_, index) => `$${index + 1}`)
          .join(", ");
        const query = `INSERT INTO ${quotedTableName} (${quotedColumns}) VALUES (${placeholders})`;

        prismaPromises.push(prisma.$executeRawUnsafe(query, ...values));

        auditLogs.push({ action: "INSERT", tableName, details: { data } });
        webhooks.push({ event: "INSERT", payload: { tableName, data } });
      } else if (type === "UPDATE") {
        const setKeys = Object.keys(data);
        const setValues = Object.values(data);
        const conditionKeys = Object.keys(conditions);
        const conditionValues = Object.values(conditions);

        const setClauses = setKeys
          .map((key, index) => `"${key.replace(/"/g, '""')}" = $${index + 1}`)
          .join(", ");

        const conditionClauses = conditionKeys
          .map(
            (key, index) =>
              `"${key.replace(/"/g, '""')}" = $${setKeys.length + index + 1}`,
          )
          .join(" AND ");

        const query = `UPDATE ${quotedTableName} SET ${setClauses} WHERE ${conditionClauses}`;
        const allValues = [...setValues, ...conditionValues];

        prismaPromises.push(prisma.$executeRawUnsafe(query, ...allValues));

        auditLogs.push({
          action: "UPDATE",
          tableName,
          details: { data, conditions },
        });
        webhooks.push({
          event: "UPDATE",
          payload: { tableName, data, conditions },
        });
      } else if (type === "DELETE") {
        const conditionKeys = Object.keys(conditions);
        const conditionValues = Object.values(conditions);

        const conditionClauses = conditionKeys
          .map((key, index) => `"${key.replace(/"/g, '""')}" = $${index + 1}`)
          .join(" AND ");

        const query = `DELETE FROM ${quotedTableName} WHERE ${conditionClauses}`;

        prismaPromises.push(
          prisma.$executeRawUnsafe(query, ...conditionValues),
        );

        auditLogs.push({
          action: "DELETE",
          tableName,
          details: { conditions },
        });
        webhooks.push({ event: "DELETE", payload: { tableName, conditions } });
      }
    }

    // 3. Execute Transaction
    await prisma.$transaction(prismaPromises);

    // 4. Post-Transaction Actions (Audit + Webhooks)
    // We execute these asynchronously or synchronously depending on requirements.
    // Ideally, audit logging should be reliable.
    if (user) {
      for (const log of auditLogs) {
        await logAudit(
          user.id,
          log.action,
          log.tableName,
          undefined,
          log.details,
        );
      }
    }

    for (const hook of webhooks) {
      triggerWebhooks(hook.event, hook.payload);
    }

    res.status(200).json({
      isSuccess: true,
      message: "Batch transaction executed successfully.",
    });
  } catch (err: any) {
    logger.error("Error executing batch transaction:", err);
    next(err);
  }
};
