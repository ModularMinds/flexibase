import prisma from "../db/client";
import { env } from "../config/env";
import { logger } from "../config/logger";
import { webhookService } from "./webhook.service";

class TrackingService {
  /**
   * Generate a tracking pixel URL for a specific email log
   */
  getPixelUrl(logId: string): string {
    return `${env.AUTH_SERVICE_URL.replace(":3001", ":3003")}/api/mailer/track/open/${logId}`;
  }

  /**
   * Inject tracking pixel into HTML content
   */
  injectPixel(html: string, logId: string): string {
    const pixelUrl = this.getPixelUrl(logId);
    const pixelTag = `<img src="${pixelUrl}" width="1" height="1" style="display:none" alt="" />`;

    if (html.includes("</body>")) {
      return html.replace("</body>", `${pixelTag}</body>`);
    }
    return html + pixelTag;
  }

  /**
   * Wrap links in HTML with tracking URLs
   */
  wrapLinks(html: string, logId: string): string {
    const baseUrl = `${env.AUTH_SERVICE_URL.replace(":3001", ":3003")}/api/mailer/track/click/${logId}`;

    // Regex to find href values in anchor tags
    // Matches href="url" or href='url'
    return html.replace(
      /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/gi,
      (match, quote, url) => {
        // Don't wrap internal tracking links or anchor fragments
        if (url.startsWith("#") || url.includes("/api/mailer/track")) {
          return match;
        }

        const encodedUrl = Buffer.from(url).toString("base64");
        const trackingUrl = `${baseUrl}?url=${encodedUrl}`;
        return match.replace(url, trackingUrl);
      },
    );
  }

  /**
   * Record a click event
   */
  async recordClick(logId: string, url: string, metadata: any) {
    try {
      await prisma.emailEvent.create({
        data: {
          logId,
          type: "CLICK",
          metadata: { ...metadata, url },
        },
      });
      logger.info(`🖱️ Email click recorded for log ${logId} (Target: ${url})`);

      // Broadcast event
      // In a full implementation, we'd fetch the webhookUrl from the EmailLog record
      // webhookService.broadcastEvent({ logId, type: "CLICK", ...metadata, url });
    } catch (error) {
      logger.error(`❌ Failed to record click event for log ${logId}:`, error);
    }
  }

  /**
   * Record an open event
   */
  async recordOpen(logId: string, metadata: any) {
    try {
      await prisma.emailEvent.create({
        data: {
          logId,
          type: "OPEN",
          metadata,
        },
      });
      logger.info(`👁️ Email open recorded for log ${logId}`);
    } catch (error) {
      logger.error(`❌ Failed to record open event for log ${logId}:`, error);
    }
  }
}

export const trackingService = new TrackingService();
