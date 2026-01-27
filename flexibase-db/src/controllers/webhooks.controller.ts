import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { logger } from "../config/logger";
import { logAudit } from "../utils/auditLogger";

export const createWebhookController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { event, targetUrl, secret } = req.body;
  const user = (req as any).user;

  try {
    const query = `
      INSERT INTO "_flexibase_webhooks" (event, target_url, secret)
      VALUES ($1, $2, $3)
      RETURNING id, event, target_url, secret, is_active, created_at
    `;
    const result: any[] = await prisma.$queryRawUnsafe(
      query,
      event,
      targetUrl,
      secret || null,
    );
    const webhook = result[0];

    if (user) {
      await logAudit(
        user.id,
        "CREATE_WEBHOOK",
        "_flexibase_webhooks",
        webhook.id,
        {
          event,
          targetUrl,
        },
      );
    }

    res.status(201).json({
      isSuccess: true,
      message: "Webhook created successfully.",
      webhook,
    });
  } catch (err) {
    logger.error("Error creating webhook:", err);
    next(err);
  }
};

export const listWebhooksController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const query = `SELECT * FROM "_flexibase_webhooks" ORDER BY created_at DESC`;
    const webhooks = await prisma.$queryRawUnsafe(query);

    res.status(200).json({
      isSuccess: true,
      webhooks,
    });
  } catch (err) {
    logger.error("Error listing webhooks:", err);
    next(err);
  }
};

export const updateWebhookController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.params;
  const { event, targetUrl, secret, isActive } = req.body;
  const user = (req as any).user;

  try {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (event !== undefined) {
      updates.push(`event = $${paramIndex++}`);
      values.push(event);
    }
    if (targetUrl !== undefined) {
      updates.push(`target_url = $${paramIndex++}`);
      values.push(targetUrl);
    }
    if (secret !== undefined) {
      updates.push(`secret = $${paramIndex++}`);
      values.push(secret);
    }
    if (isActive !== undefined) {
      updates.push(`is_active = $${paramIndex++}`);
      values.push(isActive);
    }

    if (updates.length === 0) {
      res
        .status(400)
        .json({ isSuccess: false, message: "No fields to update." });
      return;
    }

    values.push(id);
    const query = `
      UPDATE "_flexibase_webhooks"
      SET ${updates.join(", ")}
      WHERE id = $${paramIndex}::uuid
      RETURNING *
    `;

    const result: any[] = await prisma.$queryRawUnsafe(query, ...values);

    if (result.length === 0) {
      res.status(404).json({ isSuccess: false, message: "Webhook not found." });
      return;
    }

    if (user) {
      await logAudit(user.id, "UPDATE_WEBHOOK", "_flexibase_webhooks", id, {
        updates: req.body,
      });
    }

    res.status(200).json({
      isSuccess: true,
      message: "Webhook updated successfully.",
      webhook: result[0],
    });
  } catch (err) {
    logger.error("Error updating webhook:", err);
    next(err);
  }
};

export const deleteWebhookController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.params;
  const user = (req as any).user;

  try {
    const query = `DELETE FROM "_flexibase_webhooks" WHERE id = $1::uuid RETURNING id`;
    const result: any[] = await prisma.$queryRawUnsafe(query, id);

    if (result.length === 0) {
      res.status(404).json({ isSuccess: false, message: "Webhook not found." });
      return;
    }

    if (user) {
      await logAudit(user.id, "DELETE_WEBHOOK", "_flexibase_webhooks", id);
    }

    res.status(200).json({
      isSuccess: true,
      message: "Webhook deleted successfully.",
    });
  } catch (err) {
    logger.error("Error deleting webhook:", err);
    next(err);
  }
};
