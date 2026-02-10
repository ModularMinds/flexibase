import nodemailer, { Transporter } from "nodemailer";
import { env } from "../config/env";
import { logger } from "../config/logger";

export interface MailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  cc?: string;
  bcc?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType?: string;
  }>;
}

class MailerService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465, // true for 465, false for other ports
      auth: {
        user: env.SMTP_USERNAME,
        pass: env.SMTP_PASSWORD,
      },
    });

    this.verifyConnection();
  }

  private async verifyConnection() {
    try {
      await this.transporter.verify();
      logger.info("✅ SMTP connection verified successfully");
    } catch (error) {
      if (env.NODE_ENV !== "test") {
        logger.error("❌ SMTP connection failed:", error);
      }
    }
  }

  /**
   * Send an email
   */
  async sendMail(options: MailOptions) {
    const { to, subject, text, html, cc, bcc, attachments } = options;

    try {
      const info = await this.transporter.sendMail({
        from: env.SMTP_MAIL_SENDER,
        to,
        subject,
        text,
        html,
        cc,
        bcc,
        attachments,
      });

      logger.info(`📧 Email sent: ${info.messageId} to ${to}`);
      return info;
    } catch (error) {
      logger.error(`❌ Failed to send email to ${to}:`, error);
      throw error;
    }
  }
}

export const mailerService = new MailerService();
