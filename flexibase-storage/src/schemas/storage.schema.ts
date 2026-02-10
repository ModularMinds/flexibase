import { z } from "zod";

export const uploadFileSchema = z.object({
  body: z.object({
    bucket: z.string().optional().default("default"),
    visibility: z.enum(["PRIVATE", "PUBLIC", "SHARED"]).optional(),
  }),
});

export const getUploadUrlSchema = z.object({
  body: z.object({
    bucket: z.string().optional().default("default"),
    originalName: z.string().min(1, "Original name is required"),
    mimeType: z.string().min(1, "Mime type is required"),
    visibility: z.enum(["PRIVATE", "PUBLIC", "SHARED"]).optional(),
  }),
});

export const getFileSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid file ID"),
  }),
});

export const getFileContentSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid file ID"),
  }),
});

export const deleteFileSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid file ID"),
  }),
});
