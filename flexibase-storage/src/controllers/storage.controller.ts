import { Request, Response, NextFunction } from "express";
import { storageService } from "../services/storage.service";
import { logger } from "../config/logger";
import { Readable } from "stream";

export const uploadFileController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ isSuccess: false, message: "No file provided" });
      return;
    }

    const { bucket } = req.body;
    const user = (req as any).user;

    const result = await storageService.uploadFile(
      file,
      bucket || "default",
      user.id,
    );

    res.status(201).json({
      isSuccess: true,
      data: result,
    });
  } catch (err: any) {
    next(err);
  }
};

export const getFileMetadataController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const file = await storageService.getFileMetadata(id);

    if (!file) {
      res.status(404).json({ isSuccess: false, message: "File not found" });
      return;
    }

    res.status(200).json({
      isSuccess: true,
      data: file,
    });
  } catch (err: any) {
    next(err);
  }
};

export const getFileContentController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const stream = await storageService.getFileContentStream(id);

    if (!stream) {
      res
        .status(404)
        .json({ isSuccess: false, message: "File not found or S3 error" });
      return;
    }

    // Handle AWS SDK v3 stream type (Readable | ReadableStream | Blob)
    // For Node.js, we expect Readable
    if (stream instanceof Readable) {
      stream.pipe(res);
    } else {
      // Best effort conversion or direct handling if it's a web stream (node 18+)
      // @ts-ignore
      if (typeof stream.pipe === "function") {
        // @ts-ignore
        stream.pipe(res);
      } else {
        // Fallback for ByteArray or other types (not common in Node environment for GetObject)
        const bytes = await stream.transformToByteArray();
        res.send(Buffer.from(bytes));
      }
    }
  } catch (err: any) {
    next(err);
  }
};

export const deleteFileController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    await storageService.deleteFile(id);

    res.status(200).json({
      isSuccess: true,
      message: "File deleted successfully",
    });
  } catch (err: any) {
    if (err.message === "File not found") {
      res.status(404).json({ isSuccess: false, message: "File not found" });
      return;
    }
    next(err);
  }
};
