import { Router } from "express";
import {
  uploadFileController,
  getFileMetadataController,
  getFileContentController,
  deleteFileController,
  getUploadUrlController,
  getDownloadUrlController,
} from "../controllers/storage.controller";
import {
  authDelegation,
  optionalAuth,
  validateResource,
  storageRateLimiter,
  uploadRateLimiter,
} from "../middlewares";
import {
  uploadFileSchema,
  getFileSchema,
  getFileContentSchema,
  deleteFileSchema,
  getUploadUrlSchema,
} from "../schemas/storage.schema";
import { upload } from "../middlewares/upload.middleware";

export const storageRouter = Router();

// Routes are now explicitly protected or optional

/**
 * @openapi
 * /upload-url:
 *   post:
 *     tags:
 *       - Storage
 *     summary: Get presigned upload URL
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - originalName
 *               - mimeType
 *             properties:
 *               bucket:
 *                 type: string
 *               originalName:
 *                 type: string
 *               mimeType:
 *                 type: string
 *     responses:
 *       200:
 *         description: Presigned URL generated
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
storageRouter.post(
  "/upload-url",
  storageRateLimiter,
  authDelegation,
  validateResource(getUploadUrlSchema) as any,
  getUploadUrlController,
);

/**
 * @openapi
 * /upload:
 *   post:
 *     tags:
 *       - Storage
 *     summary: Upload a file (Multipart)
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
  uploadRateLimiter,
  authDelegation,
  upload.single("file") as any,
  validateResource(uploadFileSchema) as any,
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
  optionalAuth,
  validateResource(getFileSchema) as any,
  getFileMetadataController,
);

/**
 * @openapi
 * /files/{id}/url:
 *   get:
 *     tags:
 *       - Storage
 *     summary: Get presigned download URL
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
 *         description: Presigned URL generated
 *       404:
 *         description: File not found
 */
storageRouter.get(
  "/files/:id/url",
  optionalAuth,
  validateResource(getFileSchema) as any,
  getDownloadUrlController,
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
  optionalAuth,
  validateResource(getFileContentSchema) as any,
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
  storageRateLimiter,
  authDelegation,
  validateResource(deleteFileSchema) as any,
  deleteFileController,
);
