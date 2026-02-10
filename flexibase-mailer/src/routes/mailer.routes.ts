import { Router, Request, Response, NextFunction } from "express";
import { sendMailController } from "../controllers/mailer.controller";
import { authDelegation } from "../middlewares/auth.middleware";
import { validateResource } from "../middlewares/validateResource.middleware";
import { mailerRateLimiter } from "../middlewares/rateLimiter.middleware";
import { sendMailSchema } from "../schemas/mailer.schema";
import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export const mailerRouter = Router();

/**
 * @openapi
 * /send:
 *   post:
 *     tags:
 *       - Mailer
 *     summary: Send an email (enqueued)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - to
 *               - subject
 *             properties:
 *               to:
 *                 type: string
 *               subject:
 *                 type: string
 *               text:
 *                 type: string
 *               html:
 *                 type: string
 *               templateId:
 *                 type: string
 *               templateContext:
 *                 type: string
 *                 description: JSON string of context data
 *               cc:
 *                 type: string
 *               bcc:
 *                 type: string
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       202:
 *         description: Email accepted and enqueued
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 */
mailerRouter.post(
  "/send",
  mailerRateLimiter,
  authDelegation,
  upload.array("attachments"),
  (req: Request, res: Response, next: NextFunction) => {
    // Parse templateContext if it's a string (from form-data)
    if (typeof req.body.templateContext === "string") {
      try {
        req.body.templateContext = JSON.parse(req.body.templateContext);
      } catch (e) {
        res
          .status(400)
          .json({ isSuccess: false, message: "Invalid templateContext JSON" });
        return;
      }
    }
    next();
  },
  validateResource(sendMailSchema),
  sendMailController as any,
);
