import { Router } from "express";
import {
  createTableController,
  deleteTableController,
  getAllTablesController,
  getTableColumnsController,
} from "../controllers";
import { adminAuthenticator, validateResource } from "../middlewares";
import {
  createTableSchema,
  deleteTableSchema,
  getColumnsSchema,
} from "../schemas/db.schema";

const router = Router();

router.use(adminAuthenticator);

router.post(
  "/create-table",
  validateResource(createTableSchema),
  createTableController,
);
router.delete(
  "/delete-table",
  validateResource(deleteTableSchema),
  deleteTableController,
);
router.get("/get-tables", getAllTablesController);
router.get(
  "/get-columns",
  validateResource(getColumnsSchema),
  getTableColumnsController,
);

export { router as adminRouter };
