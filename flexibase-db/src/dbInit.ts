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

    // Initialize Audit Logs Table
    const checkAuditTableQuery = `
      SELECT EXISTS (
        SELECT FROM pg_catalog.pg_tables 
        WHERE schemaname = 'public' 
        AND tablename  = '_flexibase_audit_logs'
      );
    `;
    const auditResult: any[] =
      await prisma.$queryRawUnsafe(checkAuditTableQuery);
    const auditTableExists = auditResult[0].exists;

    if (!auditTableExists) {
      logger.info("Initializing audit logs table: _flexibase_audit_logs");
      const createAuditTableQuery = `
        CREATE TABLE "_flexibase_audit_logs" (
          "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          "user_id" VARCHAR(255) NOT NULL,
          "action" VARCHAR(50) NOT NULL,
          "table_name" VARCHAR(63) NOT NULL,
          "record_id" VARCHAR(255),
          "details" JSONB,
          "timestamp" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;
      await prisma.$executeRawUnsafe(createAuditTableQuery);
      logger.info("Audit logs table initialized successfully.");
    }

    // Initialize Webhooks Table
    const checkWebhooksTableQuery = `
      SELECT EXISTS (
        SELECT FROM pg_catalog.pg_tables 
        WHERE schemaname = 'public' 
        AND tablename  = '_flexibase_webhooks'
      );
    `;
    const webhooksResult: any[] = await prisma.$queryRawUnsafe(
      checkWebhooksTableQuery,
    );
    const webhooksTableExists = webhooksResult[0].exists;

    if (!webhooksTableExists) {
      logger.info("Initializing webhooks table: _flexibase_webhooks");
      const createWebhooksTableQuery = `
        CREATE TABLE "_flexibase_webhooks" (
          "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          "event" VARCHAR(50) NOT NULL,
          "target_url" TEXT NOT NULL,
          "secret" TEXT,
          "is_active" BOOLEAN DEFAULT TRUE,
          "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;
      await prisma.$executeRawUnsafe(createWebhooksTableQuery);
      logger.info("Webhooks table initialized successfully.");
    }
  } catch (err) {
    logger.error("Failed to initialize database metadata table:", err);
    throw err;
  }
};
