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
});

export const env = envSchema.parse(process.env);
