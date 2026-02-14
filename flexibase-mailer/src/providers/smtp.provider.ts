import nodemailer, { Transporter } from "nodemailer";
import { MailProvider, SendMailResult } from "./base.provider";
import { MailOptions } from "../services/mailer.service";
import { env } from "../config/env";
import { logger } from "../config/logger";

export class SmtpProvider implements MailProvider {
  name = "SMTP";
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USERNAME,
        pass: env.SMTP_PASSWORD,
      },
    });
  }

  async verify(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      logger.error("❌ SMTP verification failed:", error);
      return false;
    }
  }

  async sendMail(options: MailOptions): Promise<SendMailResult> {
    const info = await this.transporter.sendMail({
      from: env.SMTP_MAIL_SENDER,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      cc: options.cc,
      bcc: options.bcc,
      attachments: options.attachments,
    });

    return {
      messageId: info.messageId,
      provider: this.name,
    };
  }
}
