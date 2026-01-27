import { prisma } from "../config/prisma";
import { logger } from "../config/logger";

export const validateTableAccess = async (
  tableName: string,
  userRole: string,
) => {
  if (userRole === "ADMIN") return; // Admins have full access

  const checkMetadataQuery = `
    SELECT is_admin_only FROM "_flexibase_table_metadata" 
    WHERE tablename = $1
  `;

  try {
    const result: any[] = await prisma.$queryRawUnsafe(
      checkMetadataQuery,
      tableName,
    );

    if (result.length > 0 && result[0].is_admin_only === true) {
      throw new Error(
        `Forbidden: Access to table '${tableName}' is restricted to administrators.`,
      );
    }
  } catch (err: any) {
    if (err.message.startsWith("Forbidden")) throw err;
    logger.error("Error checking table access metadata:", err);
    // If the metadata table doesn't exist or table is not in it, we assume it's public (default)
  }
};
