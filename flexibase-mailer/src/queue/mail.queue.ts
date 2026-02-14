import { Queue, Worker, Job } from "bullmq";
import { env } from "../config/env";
import { logger } from "../config/logger";
import { SendMailResult, MailOptions } from "../providers/base.provider";
import { templateService } from "../services/template.service";
import { trackingService } from "../services/tracking.service";
import { providerService } from "../services/provider.service";
import prisma from "../db/client";
import IORedis from "ioredis";
import juice from "juice";

const redisConnection = new IORedis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  maxRetriesPerRequest: null,
});

export const MAIL_QUEUE_NAME = "mail-queue";

export interface MailJobData extends MailOptions {
  templateId?: string;
  templateContext?: Record<string, any>;
  locale?: string;
}

// 1. Create the Queue
export const mailQueue = new Queue(MAIL_QUEUE_NAME, {
  connection: redisConnection,
});

// 2. Create the Worker
export const mailWorker = new Worker(
  MAIL_QUEUE_NAME,
  async (job: Job<MailJobData>) => {
    const {
      to,
      subject,
      text,
      html,
      templateId,
      templateContext,
      locale,
      cc,
      bcc,
      attachments,
    } = job.data;

    logger.info(`🔄 Processing mail job ${job.id} for ${to}`);

    // 1. Create Email Log in DB
    const emailLog = await prisma.emailLog.create({
      data: {
        recipient: to,
        subject,
        status: "PENDING",
      },
    });

    try {
      let finalHtml = html;

      // 2. Render template if templateId is provided
      if (templateId) {
        finalHtml = await templateService.render(
          templateId,
          templateContext || {},
          locale,
        );
      }

      // 3. Inject tracking pixel and wrap links if HTML is present
      if (finalHtml) {
        finalHtml = trackingService.injectPixel(finalHtml, emailLog.id);
        finalHtml = trackingService.wrapLinks(finalHtml, emailLog.id);

        // 4. Inline CSS for better email client compatibility
        finalHtml = juice(finalHtml);
      }

      // 5. Send the email with failover
      const info = await providerService.sendMail({
        to,
        subject,
        text,
        html: finalHtml,
        cc,
        bcc,
        attachments,
      });

      // 6. Update Log with success
      await prisma.emailLog.update({
        where: { id: emailLog.id },
        data: {
          status: "SENT",
          messageId: info.messageId,
        },
      });

      logger.info(
        `✅ Successfully processed mail job ${job.id} (Log: ${emailLog.id})`,
      );
    } catch (error: any) {
      // Update log with failure
      await prisma.emailLog.update({
        where: { id: emailLog.id },
        data: { status: "FAILED" },
      });
      logger.error(`❌ Failed to process mail job ${job.id}:`, error);
      throw error; // Let BullMQ handle retries
    }
  },
  {
    connection: redisConnection,
    limiter: {
      max: 10,
      duration: 1000,
    },
  },
);

mailWorker.on("failed", (job, err) => {
  logger.error(`❌ Mail job ${job?.id} failed:`, err);
});
