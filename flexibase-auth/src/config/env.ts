import { config } from "dotenv";

config();

// Fallbacks for development/CI environments
process.env.FLEXIBASE_AUTH_SECRET_KEY =
  process.env.FLEXIBASE_AUTH_SECRET_KEY || "super-secret-key-123";
process.env.FLEXIBASE_AUTH_REFRESH_SECRET_KEY =
  process.env.FLEXIBASE_AUTH_REFRESH_SECRET_KEY || "refresh-secret-key-456";

console.log("Loaded environment variables");
