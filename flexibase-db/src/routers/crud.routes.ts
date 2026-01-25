import { Router } from "express";
import { insertDataController, fetchDataController } from "../controllers";
import { validateResource } from "../middlewares";
import { insertDataSchema, fetchDataSchema } from "../schemas/db.schema";

const router = Router();

router.post(
  "/insert-data",
  validateResource(insertDataSchema),
  insertDataController,
);
router.get(
  "/fetch-data",
  validateResource(fetchDataSchema),
  fetchDataController,
);

export { router as crudRouter };
