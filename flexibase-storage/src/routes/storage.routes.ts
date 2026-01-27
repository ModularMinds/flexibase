import { Router } from "express";
import {
  uploadFileController,
  getFileMetadataController,
  getFileContentController,
  deleteFileController,
} from "../controllers/storage.controller";
import { authDelegation, validateResource } from "../middlewares";
import {
  uploadFileSchema,
  getFileSchema,
  getFileContentSchema,
  deleteFileSchema,
} from "../schemas/storage.schema";
import { upload } from "../middlewares/upload.middleware";

export const storageRouter = Router();

// Apply auth to all routes
storageRouter.use(authDelegation);

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
storageRouter.post(
  "/upload",
  upload.single("file"),
  validateResource(uploadFileSchema),
  uploadFileController,
);

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
storageRouter.get(
  "/files/:id",
  validateResource(getFileSchema),
  getFileMetadataController,
);

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
storageRouter.get(
  "/files/:id/content",
  validateResource(getFileContentSchema),
  getFileContentController,
);

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
storageRouter.delete(
  "/files/:id",
  validateResource(deleteFileSchema),
  deleteFileController,
);
