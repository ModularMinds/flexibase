import "express-async-errors"; // Must be at the top
import "./config/env";

import express from "express";

// ...

import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import { rootRouter } from "./routers";
import { apiCallLogger, errorHandler } from "./middlewares";
import { logger } from "./config/logger";
import { swaggerSpec } from "./config/swagger";

export const app = express();

app.use(helmet());
app.use(cors());
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

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api", rootRouter);

app.get("/api/auth/service-check", (_, res) => {
  res.json({ isServiceAvailable: true });
});

app.use(errorHandler);
