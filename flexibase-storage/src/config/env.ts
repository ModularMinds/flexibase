import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("3002"),
  DATABASE_URL: z.string().url(),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  AUTH_SERVICE_URL: z.string().url(),
  STORAGE_BUCKET: z.string().default("flexibase_uploads"),

  // MinIO
  MINIO_ENDPOINT: z.string().url().default("http://localhost:9000"),
  MINIO_ACCESS_KEY: z.string().default("minioadmin"),
  MINIO_SECRET_KEY: z.string().default("minioadmin"),

  // Storage Quota
  MAX_USER_STORAGE_BYTES: z.coerce.number().default(1073741824), // 1GB default
});

export const env = envSchema.parse(process.env);
