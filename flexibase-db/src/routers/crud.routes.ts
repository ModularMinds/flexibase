import { Router } from "express";
import { insertDataController, fetchDataController } from "../controllers";
import { roleCheck, tokenVerifier, validateResource } from "../middlewares";
import { insertDataSchema, fetchDataSchema } from "../schemas/db.schema";

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
 *   get:
 *     tags:
 *       - CRUD
 *     summary: Fetch data from a table
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tableName
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: conditions
 *         schema:
 *           type: object
 *     responses:
 *       200:
 *         description: Data fetched successfully
 *       404:
 *         description: Table not found
 */
router.get(
  "/fetch-data",
  validateResource(fetchDataSchema),
  fetchDataController,
);

export { router as crudRouter };
