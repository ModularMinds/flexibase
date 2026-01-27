import axios from "axios";
import { prisma } from "../config/prisma";
import { logger } from "../config/logger";
import crypto from "crypto";

export const triggerWebhooks = async (eventName: string, payload: any) => {
  try {
    // 1. Fetch active webhooks for this event (or wildcard '*')
    const query = `
      SELECT * FROM "_flexibase_webhooks"
      WHERE is_active = true 
      AND (event = $1 OR event = '*')
    `;
    const webhooks: any[] = await prisma.$queryRawUnsafe(query, eventName);

    if (webhooks.length === 0) return;

    // 2. Normalize payload
    const data = {
      event: eventName,
      timestamp: new Date().toISOString(),
      payload: payload,
    };

    // 3. Fire webhooks asynchronously (fire and forget)
    // We intentionally do NOT await the mapping to avoid blocking the main thread
    webhooks.forEach(async (webhook) => {
      try {
        const headers: any = {
          "Content-Type": "application/json",
          "X-Flexibase-Event": eventName,
        };

        if (webhook.secret) {
          const signature = crypto
            .createHmac("sha256", webhook.secret)
            .update(JSON.stringify(data))
            .digest("hex");
          headers["X-Flexibase-Signature"] = signature;
        }

        await axios.post(webhook.target_url, data, {
          headers,
          timeout: 5000,
        });
      } catch (err: any) {
        logger.warn(
          `Failed to trigger webhook ${webhook.id} for event ${eventName}: ${err.message}`,
        );
      }
    });
  } catch (err) {
    logger.error("Error triggering webhooks:", err);
  }
};
