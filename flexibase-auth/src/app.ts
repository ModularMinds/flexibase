import "./config/env";

import express from "express";

import cors from "cors";

import { rootRouter } from "./routers";

import { apiCallLogger } from "./middlewares";
import { logger } from "./config/logger";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";

export const app = express();

app.use(cors());
app.use(express.json());
app.use(apiCallLogger);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api", rootRouter);

app.get("/api/auth/service-check", (_, res) => {
  res.json({ isServiceAvailable: true });
});
