import { Router } from "express";
import {
  insertDataController,
  fetchDataController,
  updateDataController,
  deleteDataController,
  upsertDataController,
  importDataController,
  exportDataController,
  batchTransactionController,
} from "../controllers";
import { roleCheck, tokenVerifier, validateResource } from "../middlewares";
import { upload } from "../config/upload.config";
import {
  insertDataSchema,
  fetchDataSchema,
  updateDataSchema,
  deleteDataSchema,
  upsertDataSchema,
  transactionSchema,
} from "../schemas/db.schema";

const router = Router();

router.use(tokenVerifier, roleCheck(["USER", "ADMIN"]));

/**
 * @openapi
 * /db/crud/insert-data:
 *   post:
 *     tags:
 *       - CRUD
 *     summary: Insert data into a table
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
 *               - data
 *             properties:
 *               tableName:
 *                 type: string
 *               data:
 *                 type: object
 *     responses:
 *       201:
 *         description: Data inserted successfully
 *       400:
 *         description: Invalid input
 */
router.post(
  "/insert-data",
  validateResource(insertDataSchema),
  insertDataController,
);

/**
 * @openapi
 * /db/crud/fetch-data:
 *   post:
 *     tags:
 *       - CRUD
 *     summary: Fetch data from a table with advanced querying
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
 *               columns:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of columns to return (projections)
 *               filters:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     column:
 *                       type: string
 *                     operator:
 *                       type: string
 *                       enum: [eq, neq, gt, gte, lt, lte, like, in]
 *                     value:
 *                       type: any
 *               sort:
 *                 type: object
 *                 properties:
 *                   column:
 *                     type: string
 *                   direction:
 *                     type: string
 *                     enum: [asc, desc]
 *               limit:
 *                 type: integer
 *               offset:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Data fetched successfully
 *       400:
 *         description: Invalid input
 */
router.post(
  "/fetch-data",
  validateResource(fetchDataSchema),
  fetchDataController,
);

/**
 * @openapi
 * /db/crud/update-data:
 *   patch:
 *     tags:
 *       - CRUD
 *     summary: Update data in a table
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
 *               - data
 *               - conditions
 *             properties:
 *               tableName:
 *                 type: string
 *               data:
 *                 type: object
 *               conditions:
 *                 type: object
 *     responses:
 *       200:
 *         description: Data updated successfully
 *       400:
 *         description: Invalid input
 */
router.patch(
  "/update-data",
  validateResource(updateDataSchema),
  updateDataController,
);

/**
 * @openapi
 * /db/crud/delete-data:
 *   delete:
 *     tags:
 *       - CRUD
 *     summary: Delete data from a table
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
 *               - conditions
 *             properties:
 *               tableName:
 *                 type: string
 *               conditions:
 *                 type: object
 *     responses:
 *       200:
 *         description: Data deleted successfully
 *       400:
 *         description: Invalid input
 */
router.delete(
  "/delete-data",
  validateResource(deleteDataSchema),
  deleteDataController,
);

/**
 * @openapi
 * /db/crud/upsert-data:
 *   post:
 *     tags:
 *       - CRUD
 *     summary: Upsert data into a table (Insert or Update on conflict)
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
 *               - data
 *               - conflictColumns
 *             properties:
 *               tableName:
 *                 type: string
 *               data:
 *                 type: object
 *               conflictColumns:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Data upserted successfully
 *       400:
 *         description: Invalid input
 */
router.post(
  "/upsert-data",
  validateResource(upsertDataSchema),
  upsertDataController,
);

router.post(
  "/import-data",
  upload.single("file"),
  roleCheck(["ADMIN"]), // Restrict import to Admin or implement granular checks
  // validateResource(importDataSchema) - manual validation for file + body
  importDataController,
);

router.get(
  "/export-data",
  roleCheck(["ADMIN"]),
  // validateResource(exportDataSchema) - query validation
  exportDataController,
);

/**
 * @openapi
 * /db/crud/transaction:
 *   post:
 *     tags:
 *       - CRUD
 *     summary: Execute a batch transaction
 *     description: Execute multiple operations (INSERT, UPDATE, DELETE) atomically.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - operations
 *             properties:
 *               operations:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - type
 *                     - tableName
 *                   properties:
 *                     type:
 *                       type: string
 *                       enum: [INSERT, UPDATE, DELETE]
 *                     tableName:
 *                       type: string
 *                     data:
 *                       type: object
 *                       description: Required for INSERT/UPDATE
 *                     conditions:
 *                       type: object
 *                       description: Required for UPDATE/DELETE
 *     responses:
 *       200:
 *         description: Transaction executed successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Transaction failed
 */
router.post(
  "/transaction",
  roleCheck(["ADMIN", "USER"]), // Allow users with access
  validateResource(transactionSchema),
  batchTransactionController,
);

export { router as crudRouter };
