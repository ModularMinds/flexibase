import { Router } from "express";
import { previewEmailController } from "../controllers/preview.controller";
import {
  authDelegation as authMiddleware,
  roleMiddleware,
} from "../middlewares/auth.middleware";

export const mailerToolsRouter = Router();

/**
 * @openapi
 * /tools/preview/{templateId}:
 *   get:
 *     tags:
 *       - Developer Tools
 *     summary: Preview a rendered template
 *     parameters:
 *       - name: templateId
 *         in: path
 *         required: true
 *       - name: context
 *         in: query
 *         description: JSON string of context variables
 *       - name: locale
 *         in: query
 */
mailerToolsRouter.get(
  "/preview/:templateId",
  authMiddleware as any,
  roleMiddleware(["ADMIN"]) as any,
  previewEmailController as any,
);
