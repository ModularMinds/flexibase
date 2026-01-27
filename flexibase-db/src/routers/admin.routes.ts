import { Router } from "express";
import {
  createTableController,
  deleteTableController,
  getAllTablesController,
  getTableColumnsController,
  alterTableController,
  createIndexController,
  getAuditLogsController,
  createWebhookController,
  listWebhooksController,
  updateWebhookController,
  deleteWebhookController,
} from "../controllers";
import { roleCheck, tokenVerifier, validateResource } from "../middlewares";
import {
  createTableSchema,
  deleteTableSchema,
  getColumnsSchema,
  alterTableSchema,
  createIndexSchema,
  getAuditLogsSchema,
  createWebhookSchema,
  updateWebhookSchema,
  deleteWebhookSchema,
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
 *       404:
 *         description: Table not found
 */
router.delete(
  "/delete-table",
  roleCheck(["ADMIN"]),
  validateResource(deleteTableSchema),
  deleteTableController,
);

/**
 * @openapi
 * /db/admin/alter-table:
 *   patch:
 *     tags:
 *       - Admin
 *     summary: Alter a database table (Add/Drop columns)
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
 *               - action
 *             properties:
 *               tableName:
 *                 type: string
 *               action:
 *                 type: string
 *                 enum: [ADD, DROP, TOGGLE_ADMIN_ONLY]
 *               column:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   type:
 *                     type: string
 *                   constraints:
 *                     type: string
 *               isAdminOnly:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Table altered successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.patch(
  "/alter-table",
  roleCheck(["ADMIN"]),
  validateResource(alterTableSchema),
  alterTableController,
);

/**
 * @openapi
 * /db/admin/create-index:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Create an index on a table
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
 *               - indexName
 *               - columns
 *             properties:
 *               tableName:
 *                 type: string
 *               indexName:
 *                 type: string
 *               columns:
 *                 type: array
 *                 items:
 *                   type: string
 *               unique:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Index created successfully
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/create-index",
  roleCheck(["ADMIN"]),
  validateResource(createIndexSchema),
  createIndexController,
);

/**
 * @openapi
 * /db/admin/get-tables:
 *   get:
 *     tags:
 *       - Meta
 *     summary: Get all tables
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tables
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                 tables:
 *                   type: array
 *                   items:
 *                     type: string
 */
router.get("/get-tables", roleCheck(["USER", "ADMIN"]), getAllTablesController);

/**
 * @openapi
 * /db/admin/get-columns:
 *   get:
 *     tags:
 *       - Meta
 *     summary: Get columns of a table
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tableName
 *         schema:
 *           type: string
 *         required: true
 *         description: Name of the table
 *     responses:
 *       200:
 *         description: List of columns
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                 columns:
 *                   type: array
 *                   items:
 *                     type: string
 */
router.get(
  "/get-columns",
  roleCheck(["USER", "ADMIN"]),
  validateResource(getColumnsSchema),
  getTableColumnsController,
);

/**
 * @openapi
 * /db/admin/get-audit-logs:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get audit logs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tableName
 *         schema:
 *           type: string
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of audit logs
 */
router.get(
  "/get-audit-logs",
  roleCheck(["ADMIN"]),
  validateResource(getAuditLogsSchema),
  getAuditLogsController,
);

// Webhooks
/**
 * @openapi
 * /db/admin/webhooks:
 *   post:
 *     tags:
 *       - Webhooks
 *     summary: Create a webhook
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - event
 *               - targetUrl
 *             properties:
 *               event:
 *                 type: string
 *                 enum: [INSERT, UPDATE, DELETE, CREATE_TABLE, ALTER_TABLE, DELETE_TABLE]
 *               targetUrl:
 *                 type: string
 *               secret:
 *                 type: string
 *     responses:
 *       201:
 *         description: Webhook created
 *   get:
 *     tags:
 *       - Webhooks
 *     summary: List all webhooks
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of webhooks
 */
// Webhooks
router.post(
  "/webhooks",
  roleCheck(["ADMIN"]),
  validateResource(createWebhookSchema),
  createWebhookController,
);

router.get("/webhooks", roleCheck(["ADMIN"]), listWebhooksController);

/**
 * @openapi
 * /db/admin/webhooks/{id}:
 *   patch:
 *     tags:
 *       - Webhooks
 *     summary: Update a webhook
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event:
 *                 type: string
 *               targetUrl:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Webhook updated
 *   delete:
 *     tags:
 *       - Webhooks
 *     summary: Delete a webhook
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Webhook deleted
 */
router.patch(
  "/webhooks/:id",
  roleCheck(["ADMIN"]),
  validateResource(updateWebhookSchema),
  updateWebhookController,
);

router.delete(
  "/webhooks/:id",
  roleCheck(["ADMIN"]),
  validateResource(deleteWebhookSchema),
  deleteWebhookController,
);

export { router as adminRouter };
