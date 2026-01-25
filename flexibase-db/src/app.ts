import { env } from "./config/env";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { rootRouter } from "./routers";
import {
  apiCallLogger,
  errorHandler,
  requestId,
  tokenVerifier,
  roleCheck,
} from "./middlewares";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.config";
import { logger } from "./config/logger";
import { initializeDatabase } from "./dbInit";

export const app = express();

app.use(requestId);
app.use(helmet());

const allowedOrigins = env.ALLOWED_ORIGINS.split(",");
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Request-ID"],
  }),
);
app.use(express.json());
app.use(apiCallLogger);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

/**
 * @openapi
 * /db/service-check:
 *   get:
 *     summary: Service health check
 *     responses:
 *       200:
 *         description: Service is available
 */
app.use("/api/db/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api", rootRouter);

app.get("/api/db/service-check", (_, res) => {
  res.json({ isServiceAvailable: true });
});

app.use(errorHandler);

if (process.env.NODE_ENV !== "test") {
  const startServer = async () => {
    try {
      await initializeDatabase();
      const server = app.listen(env.FLEXIBASE_DB_EXPOSE_PORT, () => {
        logger.info(
          `Flexibase DB started successfully on port ${env.FLEXIBASE_DB_EXPOSE_PORT}`,
        );
      });

      const shutdown = async () => {
        logger.info("Service is shutting down...");
        server.close(async () => {
          logger.info("Express server closed.");
          process.exit(0);
        });

        setTimeout(() => {
          logger.error(
            "Could not close connections in time, forcefully shutting down",
          );
          process.exit(1);
        }, 10000);
      };

      process.on("SIGTERM", shutdown);
      process.on("SIGINT", shutdown);
    } catch (err) {
      logger.error(
        "Failed to start server due to database initialization failure:",
        err,
      );
      process.exit(1);
    }
  };

  startServer();
}
