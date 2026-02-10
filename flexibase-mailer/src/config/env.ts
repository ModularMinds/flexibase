import { z } from "zod";
import { config } from "dotenv";

config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().transform(Number).default("3003"),
  SMTP_HOST: z.string(),
  SMTP_PORT: z.string().transform(Number),
  SMTP_USERNAME: z.string(),
  SMTP_PASSWORD: z.string(),
  SMTP_MAIL_SENDER: z.string().email(),
  AUTH_SERVICE_URL: z.string().url().default("http://localhost:3001"),
  REDIS_HOST: z.string().default("localhost"),
  REDIS_PORT: z.string().transform(Number).default("6379"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  if (process.env.NODE_ENV !== "test") {
    console.error("❌ Invalid environment variables:", parsed.error.format());
    process.exit(1);
  }
}

export const env = parsed.success ? parsed.data : ({} as any);
