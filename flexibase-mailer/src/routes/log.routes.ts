import { Router } from "express";
import { getLogsController } from "../controllers/log.controller";
import { authDelegation, roleMiddleware } from "../middlewares/auth.middleware";

export const logRouter = Router();

/**
 * @openapi
 * /logs:
 *   get:
 *     tags:
 *       - Logs
 *     summary: List email logs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of email logs
 */
logRouter.get(
  "/logs",
  authDelegation,
  roleMiddleware(["ADMIN"]),
  getLogsController,
);
