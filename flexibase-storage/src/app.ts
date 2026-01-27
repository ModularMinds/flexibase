import "./config/env";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { storageRouter } from "./routes/storage.routes";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import { logger } from "./config/logger";
import { env } from "./config/env";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.config";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/storage", storageRouter);

// Service check
app.get("/api/storage/service-check", (_, res) => {
  res.json({ isServiceAvailable: true });
});

// Swagger
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Error Handler
app.use(errorHandler);

const port = env.PORT;

if (require.main === module) {
  app.listen(port, () => {
    logger.info(
      `FlexiBase-Storage service started successfully on port ${port}`,
    );
  });
}

export { app };
