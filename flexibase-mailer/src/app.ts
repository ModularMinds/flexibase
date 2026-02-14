import "./config/env";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { mailerRouter } from "./routes/mailer.routes";
import { trackingRouter } from "./routes/tracking.routes";
import { mailerToolsRouter } from "./routes/mailer-tools.routes";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.config";

const app = express();

import rateLimit from "express-rate-limit";

// Security & Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(limiter);

// Logger Middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/api/mailer", mailerRouter);
app.use("/api/mailer/track", trackingRouter);
app.use("/api/mailer/tools", mailerToolsRouter);

// Swagger
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Service check
app.get("/api/mailer/service-check", (_, res) => {
  res.json({ isServiceAvailable: true });
});

// Error Handler
app.use(errorHandler);

const port = env.PORT;

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    logger.info(`🚀 FlexiBase Mailer service started on port ${port}`);
  });
}

export { app };
