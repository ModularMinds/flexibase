import { z } from "zod";

export const uploadFileSchema = z.object({
  body: z.object({
    bucket: z.string().optional().default("default"),
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
