import { Router } from "express";
import {
  trackOpenController,
  trackClickController,
} from "../controllers/tracking.controller";

export const trackingRouter = Router();

/**
 * @openapi
 * /track/open/{logId}:
 *   get:
 *     tags:
 *       - Tracking
 *     summary: Tracking pixel endpoint
 *     parameters:
 *       - name: logId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 */
trackingRouter.get("/open/:logId", trackOpenController as any);

/**
 * @openapi
 * /track/click/{logId}:
 *   get:
 *     tags:
 *       - Tracking
 *     summary: Link tracking redirection endpoint
 *     parameters:
 *       - name: logId
 *         in: path
 *         required: true
 *       - name: url
 *         in: query
 *         required: true
 */
trackingRouter.get("/click/:logId", trackClickController as any);
