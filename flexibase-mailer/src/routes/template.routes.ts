import { Router } from "express";
import { listTemplatesController } from "../controllers/template.controller";
import { authDelegation, roleMiddleware } from "../middlewares/auth.middleware";

export const templateRouter = Router();

/**
 * @openapi
 * /templates:
 *   get:
 *     tags:
 *       - Templates
 *     summary: List available email templates
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of templates
 */
templateRouter.get(
  "/templates",
  authDelegation,
  roleMiddleware(["ADMIN"]),
  listTemplatesController,
);
