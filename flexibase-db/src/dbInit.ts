import { prisma } from "./config/prisma";
import { logger } from "./config/logger";

export const initializeDatabase = async () => {
  const checkTableQuery = `
    SELECT EXISTS (
      SELECT FROM pg_catalog.pg_tables 
      WHERE schemaname = 'public' 
      AND tablename  = '_flexibase_table_metadata'
    );
  `;

  try {
    const result: any[] = await prisma.$queryRawUnsafe(checkTableQuery);
    const tableExists = result[0].exists;

    if (!tableExists) {
      logger.info("Initializing metadata table: _flexibase_table_metadata");
      const createMetadataTableQuery = `
        CREATE TABLE "_flexibase_table_metadata" (
          "tablename" VARCHAR(63) PRIMARY KEY,
          "is_admin_only" BOOLEAN DEFAULT FALSE,
          "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;
      await prisma.$executeRawUnsafe(createMetadataTableQuery);
      logger.info("Metadata table initialized successfully.");
    }
  } catch (err) {
    logger.error("Failed to initialize database metadata table:", err);
    throw err;
  }
};
