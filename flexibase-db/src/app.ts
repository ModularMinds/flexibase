import "./config/env";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { rootRouter } from "./routers";
import { apiCallLogger, errorHandler } from "./middlewares";

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

app.use("/api", rootRouter);

app.get("/api/db/service-check", (_, res) => {
  res.json({ isServiceAvailable: true });
});

app.use(errorHandler);

if (process.env.NODE_ENV !== "test") {
  app.listen(process.env.FLEXIBASE_DB_EXPOSE_PORT, () => {
    console.log(
      `Flexibase DB started successfully on port ${process.env.FLEXIBASE_DB_EXPOSE_PORT}`,
    );
  });
}
