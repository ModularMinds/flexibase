import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  DATABASE_URL: z.string().url(),
  FLEXIBASE_DB_EXPOSE_PORT: z.string().default("3001"),
  ALLOWED_ORIGINS: z.string().default("*"),
  AUTH_SERVICE_URL: z.string().url().default("http://flexibase-auth:3000/api"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
