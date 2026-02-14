import { NextFunction, Request, Response } from "express";
import { mailQueue } from "../queue/mail.queue";
import { SendMailInput } from "../schemas/mailer.schema";
import { logger } from "../config/logger";

export const sendMailController = async (
  req: Request<{}, {}, SendMailInput>,
  res: Response,
  next: NextFunction,
) => {
  try {
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
    } = req.body;

    // Handle attachments from multer
    const attachments = ((req as any).files as any[])?.map((file: any) => ({
      filename: file.originalname,
      content: file.buffer,
      contentType: file.mimetype,
    }));

    const job = await mailQueue.add("send-mail", {
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
    });

    logger.info(`📨 Enqueued mail job ${job.id} for ${to}`);

    res.status(202).json({
      isSuccess: true,
      message: "Email request accepted and enqueued",
      data: {
        jobId: job.id,
      },
    });
  } catch (error) {
    next(error);
  }
};
