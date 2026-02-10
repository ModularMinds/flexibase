import { Queue, Worker, Job } from "bullmq";
import { env } from "../config/env";
import { logger } from "../config/logger";
import { mailerService, MailOptions } from "../services/mailer.service";
import { templateService } from "../services/template.service";
import IORedis from "ioredis";

const redisConnection = new IORedis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  maxRetriesPerRequest: null,
});

export const MAIL_QUEUE_NAME = "mail-queue";

export interface MailJobData extends MailOptions {
  templateId?: string;
  templateContext?: Record<string, any>;
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
      cc,
      bcc,
      attachments,
    } = job.data;

    logger.info(`🔄 Processing mail job ${job.id} for ${to}`);

    try {
      let finalHtml = html;

      // Render template if templateId is provided
      if (templateId) {
        finalHtml = await templateService.render(
          templateId,
          templateContext || {},
        );
      }

      await mailerService.sendMail({
        to,
        subject,
        text,
        html: finalHtml,
        cc,
        bcc,
        attachments,
      });

      logger.info(`✅ Successfully processed mail job ${job.id}`);
    } catch (error) {
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
