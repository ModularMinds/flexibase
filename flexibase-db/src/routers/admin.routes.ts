import { Router } from "express";
import {
  createTableController,
  deleteTableController,
  getAllTablesController,
  getTableColumnsController,
  alterTableController,
  createIndexController,
} from "../controllers";
import { roleCheck, tokenVerifier, validateResource } from "../middlewares";
import {
  createTableSchema,
  deleteTableSchema,
  getColumnsSchema,
  alterTableSchema,
  createIndexSchema,
} from "../schemas/db.schema";

const router = Router();

router.use(tokenVerifier);

/**
 * @openapi
 * /db/admin/create-table:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Create a new database table
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tableName
 *               - tableColumns
 *             properties:
 *               tableName:
 *                 type: string
 *               tableColumns:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     type:
 *                       type: string
 *                     constraints:
 *                       type: string
 *     responses:
 *       201:
 *         description: Table created successfully
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/create-table",
  roleCheck(["ADMIN"]),
  validateResource(createTableSchema),
  createTableController,
);

router.delete(
  "/delete-table",
  roleCheck(["ADMIN"]),
  validateResource(deleteTableSchema),
  deleteTableController,
);

router.patch(
  "/alter-table",
  roleCheck(["ADMIN"]),
  validateResource(alterTableSchema),
  alterTableController,
);

router.post(
  "/create-index",
  roleCheck(["ADMIN"]),
  validateResource(createIndexSchema),
  createIndexController,
);

router.get("/get-tables", roleCheck(["USER", "ADMIN"]), getAllTablesController);

router.get(
  "/get-columns",
  roleCheck(["USER", "ADMIN"]),
  validateResource(getColumnsSchema),
  getTableColumnsController,
);

export { router as adminRouter };
