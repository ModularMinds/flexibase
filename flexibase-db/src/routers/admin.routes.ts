import { Router } from "express";
import {
  createTableController,
  deleteTableController,
  getAllTablesController,
  getTableColumnsController,
} from "../controllers";
import { roleCheck, tokenVerifier, validateResource } from "../middlewares";
import {
  createTableSchema,
  deleteTableSchema,
  getColumnsSchema,
} from "../schemas/db.schema";

const router = Router();

router.use(tokenVerifier, roleCheck(["ADMIN"]));

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
  validateResource(createTableSchema),
  createTableController,
);
/**
 * @openapi
 * /db/admin/delete-table:
 *   delete:
 *     tags:
 *       - Admin
 *     summary: Delete a database table
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
 *             properties:
 *               tableName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Table deleted successfully
 *       401:
 *         description: Unauthorized
 */
router.delete(
  "/delete-table",
  validateResource(deleteTableSchema),
  deleteTableController,
);
/**
 * @openapi
 * /db/admin/get-tables:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get all tables in the public schema
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tables
 *       401:
 *         description: Unauthorized
 */
router.get("/get-tables", getAllTablesController);
/**
 * @openapi
 * /db/admin/get-columns:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get columns for a specific table
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tableName
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of columns
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Table not found
 */
router.get(
  "/get-columns",
  validateResource(getColumnsSchema),
  getTableColumnsController,
);

export { router as adminRouter };
