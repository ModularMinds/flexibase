import { z } from "zod";

export const sendMailSchema = z.object({
  body: z
    .object({
      to: z.string().email("Invalid recipient email address"),
      subject: z.string().min(1, "Subject is required"),
      text: z.string().optional(),
      html: z.string().optional(),
      templateId: z.string().optional(),
      templateContext: z.record(z.any()).optional(),
      locale: z.string().optional(),
      cc: z.string().email("Invalid CC email address").optional(),
      bcc: z.string().email("Invalid BCC email address").optional(),
    })
    .refine((data) => data.text || data.html || data.templateId, {
      message: "Either text, html, or templateId must be provided",
      path: ["text"],
    }),
});

export type SendMailInput = z.infer<typeof sendMailSchema>["body"];
