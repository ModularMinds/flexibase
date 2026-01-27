import fs from "fs";
import path from "path";
import { prisma } from "../config/prisma";
import { env } from "../config/env";
import { logger } from "../config/logger";

const UPLOAD_DIR = path.join(process.cwd(), env.STORAGE_BUCKET);

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export const storageService = {
  uploadFile: async (
    file: Express.Multer.File,
    bucket: string,
    userId: string,
  ) => {
    // Create bucket dir if different from default
    const bucketDir = path.join(process.cwd(), bucket);
    if (!fs.existsSync(bucketDir)) {
      fs.mkdirSync(bucketDir, { recursive: true });
    }

    // Move file from temporary location (or if using memory storage, write it)
    // Multer diskStorage puts it in dest. If we want to organize by bucket:
    const targetPath = path.join(bucketDir, file.filename);

    // If multer config saved it elsewhere, move it.
    // Assuming we configure multer to save to temp or root uploads.
    // Let's assume multer saves to `uploads/` and we want `uploads/bucket/`?
    // For simplicity, let's keep it handled by multer middleware config or move here.
    // Use the file.path provided by multer.

    const savedFile = await prisma.file.create({
      data: {
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: file.path,
        bucket: bucket,
        userId: userId,
      },
    });

    return savedFile;
  },

  getFileMetadata: async (fileId: string) => {
    return prisma.file.findUnique({
      where: { id: fileId },
    });
  },

  getFileContentPath: async (fileId: string) => {
    const file = await prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) return null;
    return file.path;
  },

  deleteFile: async (fileId: string) => {
    const file = await prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      throw new Error("File not found");
    }

    // Delete from FS
    if (fs.existsSync(file.path)) {
      try {
        fs.unlinkSync(file.path);
      } catch (err: any) {
        logger.error(`Failed to delete file from disk: ${file.path}`, err);
        // Continue to delete from DB? Yes.
      }
    }

    await prisma.file.delete({
      where: { id: fileId },
    });

    return true;
  },
};
