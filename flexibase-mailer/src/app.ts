import "./config/env";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { mailerRouter } from "./routes/mailer.routes";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.config";

const app = express();

// Security & Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Logger Middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/api/mailer", mailerRouter);

// Swagger
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Service check
app.get("/api/mailer/service-check", (_, res) => {
  res.json({ isServiceAvailable: true });
});

// Error Handler
app.use(errorHandler);

const port = env.PORT;

app.listen(port, () => {
  logger.info(`🚀 FlexiBase Mailer service started on port ${port}`);
});

export { app };
