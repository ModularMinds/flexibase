import { prisma } from "../config/prisma";
import { logger } from "../config/logger";

export const logAudit = async (
  userId: string,
  action: string,
  tableName: string,
  recordId?: string,
  details?: Record<string, any>,
) => {
  try {
    await prisma.$executeRawUnsafe(
      `INSERT INTO "_flexibase_audit_logs" (user_id, action, table_name, record_id, details) VALUES ($1, $2, $3, $4, $5)`,
      userId,
      action,
      tableName,
      recordId || null,
      details ? JSON.stringify(details) : null,
    );
  } catch (error) {
    logger.error("Failed to log audit entry:", error);
  }
};
