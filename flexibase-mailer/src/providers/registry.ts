import { MailProvider } from "./base.provider";
import { SmtpProvider } from "./smtp.provider";
import { logger } from "../config/logger";

class ProviderRegistry {
  private providers: MailProvider[] = [];

  constructor() {
    // Default to SMTP
    this.register(new SmtpProvider());

    // Future: Add SES or SendGrid here
    // if (env.SES_ACCESS_KEY) this.register(new SesProvider());
  }

  register(provider: MailProvider) {
    this.providers.push(provider);
    logger.info(`📦 Registered mail provider: ${provider.name}`);
  }

  getProviders(): MailProvider[] {
    return this.providers;
  }

  getPrimaryProvider(): MailProvider {
    if (this.providers.length === 0) {
      throw new Error("No mail providers registered");
    }
    return this.providers[0];
  }
}

export const providerRegistry = new ProviderRegistry();
