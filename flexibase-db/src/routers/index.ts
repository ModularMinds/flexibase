import { Router } from "express";
import { crudRouter } from "./crud.routes";
import { adminRouter } from "./admin.routes";

export const rootRouter = Router();

rootRouter.use("/db/admin", adminRouter);
rootRouter.use("/db", crudRouter);
