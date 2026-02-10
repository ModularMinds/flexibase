"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storageRouter = void 0;
const express_1 = require("express");
const storage_controller_1 = require("../controllers/storage.controller");
const middlewares_1 = require("../middlewares");
const storage_schema_1 = require("../schemas/storage.schema");
const upload_middleware_1 = require("../middlewares/upload.middleware");
exports.storageRouter = (0, express_1.Router)();
// Apply auth to all routes
exports.storageRouter.use(middlewares_1.authDelegation);
/**
 * @openapi
 * /upload:
 *   post:
 *     tags:
 *       - Storage
 *     summary: Upload a file
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               bucket:
 *                 type: string
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
exports.storageRouter.post("/upload", upload_middleware_1.upload.single("file"), (0, middlewares_1.validateResource)(storage_schema_1.uploadFileSchema), storage_controller_1.uploadFileController);
/**
 * @openapi
 * /files/{id}:
 *   get:
 *     tags:
 *       - Storage
 *     summary: Get file metadata
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
 *         description: File metadata
 *       404:
 *         description: File not found
 */
exports.storageRouter.get("/files/:id", (0, middlewares_1.validateResource)(storage_schema_1.getFileSchema), storage_controller_1.getFileMetadataController);
/**
 * @openapi
 * /files/{id}/content:
 *   get:
 *     tags:
 *       - Storage
 *     summary: Download file content
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
 *         description: File content
 *       404:
 *         description: File not found
 */
exports.storageRouter.get("/files/:id/content", (0, middlewares_1.validateResource)(storage_schema_1.getFileContentSchema), storage_controller_1.getFileContentController);
/**
 * @openapi
 * /files/{id}:
 *   delete:
 *     tags:
 *       - Storage
 *     summary: Delete a file
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
 *         description: File deleted successfully
 *       404:
 *         description: File not found
 */
exports.storageRouter.delete("/files/:id", (0, middlewares_1.validateResource)(storage_schema_1.deleteFileSchema), storage_controller_1.deleteFileController);
