import { providerRegistry } from "../providers/registry";
import { MailOptions, SendMailResult } from "../providers/base.provider";
import { logger } from "../config/logger";

class ProviderService {
  /**
   * Send mail with automatic failover
   */
  async sendMail(options: any): Promise<SendMailResult> {
    const providers = providerRegistry.getProviders();
    let lastError: any;

    for (const provider of providers) {
      try {
        logger.info(`🔄 Attempting to send using provider: ${provider.name}`);
        return await provider.sendMail(options);
      } catch (error) {
        logger.warn(`⚠️ Provider ${provider.name} failed:`, error);
        lastError = error;
        // Continue to next provider
      }
    }

    logger.error("❌ All mail providers failed");
    throw (
      lastError ||
      new Error("Failed to send email through all available providers")
    );
  }
}

export const providerService = new ProviderService();
