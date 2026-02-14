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

export interface SendMailResult {
  messageId?: string;
  provider: string;
}

export interface MailProvider {
  name: string;
  sendMail(options: MailOptions): Promise<SendMailResult>;
  verify(): Promise<boolean>;
}
