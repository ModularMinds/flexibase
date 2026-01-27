import { Router } from "express";

import { storageRouter } from "./storage.routes";
import { adminRouter } from "./admin.routes";

import { adminAuthenticator } from "../middlewares";

export const rootRouter = Router();

rootRouter.use("/storage/admin", adminAuthenticator, adminRouter);
rootRouter.use("/storage", storageRouter);
