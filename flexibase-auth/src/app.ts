import "./config/env";

import express from "express";

// ...

import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import { rootRouter } from "./routers";
import { apiCallLogger, errorHandler, requestId } from "./middlewares";
import { logger } from "./config/logger";
import { swaggerSpec } from "./config/swagger";

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(requestId); // Must be before logger
app.use(apiCallLogger);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

app.use("/api/auth/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api", rootRouter);

/**
 * @openapi
 * /auth/service-check:
 *   get:
 *     summary: Service health check
 *     tags: [Utility]
 *     responses:
 *       200:
 *         description: Service is available
 */
app.get("/api/auth/service-check", (_, res) => {
  res.json({ isServiceAvailable: true });
});

app.use(errorHandler);
