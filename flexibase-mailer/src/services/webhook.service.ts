import axios from "axios";
import { logger } from "../config/logger";

class WebhookService {
  /**
   * Send a webhook notification to a specific URL
   */
  async notify(webhookUrl: string, payload: any) {
    try {
      await axios.post(
        webhookUrl,
        {
          isSuccess: true,
          event: payload.type,
          data: payload,
          timestamp: new Date().toISOString(),
        },
        {
          timeout: 5000,
        },
      );
      logger.info(`🪝 Webhook sent to ${webhookUrl} for event ${payload.type}`);
    } catch (error) {
      logger.error(`❌ Failed to send webhook to ${webhookUrl}:`, error);
    }
  }

  /**
   * Broadcast an email event to configured webhooks
   * In a real app, this would query a user's webhook configurations.
   * For Flexibase, we can use an environment variable or a per-request webhookUrl.
   */
  async broadcastEvent(payload: any, webhookUrl?: string) {
    if (!webhookUrl) return;

    // Process in background
    this.notify(webhookUrl, payload).catch((err) => {
      logger.error("Error in webhook broadcast:", err);
    });
  }
}

export const webhookService = new WebhookService();
