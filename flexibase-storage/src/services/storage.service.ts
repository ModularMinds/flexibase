import { prisma } from "../config/prisma";
import { env } from "../config/env";
import { logger } from "../config/logger";
import { s3Client } from "../config/s3";
import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  HeadBucketCommand,
  ListObjectsV2Command,
  CreateBucketCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from "fs";
import { FileVisibility } from "@prisma/client";
import { policyService, UserContext } from "./policy.service";
import { imageService, ResizeOptions } from "./image.service";
import { Readable } from "stream";

// Ensure bucket exists function
const ensureBucket = async (bucketName: string) => {
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
  } catch (err: any) {
    // If bucket not found, create it
    if (err.name === "NotFound" || err.$metadata?.httpStatusCode === 404) {
      logger.info(`Bucket ${bucketName} does not exist, creating...`);
      await s3Client.send(new CreateBucketCommand({ Bucket: bucketName }));
    } else {
      throw err;
    }
  }
};

// Helper to convert stream to buffer
const streamToBuffer = async (stream: Readable): Promise<Buffer> => {
  const chunks: any[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
};

export const storageService = {
  checkQuota: async (userId: string, newFileSize: number) => {
    // Sum size of all files owned by user
    const aggregation = await prisma.file.aggregate({
      where: { userId },
      _sum: { size: true },
    });

    const currentUsage = aggregation._sum.size || 0;
    const limit = env.MAX_USER_STORAGE_BYTES;

    if (currentUsage + newFileSize > limit) {
      throw new Error(
        `Storage quota exceeded. Limit: ${limit} bytes, Usage: ${currentUsage} bytes, New File: ${newFileSize} bytes`,
      );
    }
  },

  uploadFile: async (
    file: Express.Multer.File,
    bucket: string,
    userId: string,
    visibility: FileVisibility = FileVisibility.PRIVATE,
  ) => {
    // Basic mime validation for consistency
    if (
      !imageService.isSupportedImage(file.mimetype) &&
      !file.mimetype.startsWith("application/") &&
      !file.mimetype.startsWith("text/")
    ) {
      logger.warn(`Uploading uncommon mime type: ${file.mimetype}`);
    }

    await ensureBucket(bucket);
    await storageService.checkQuota(userId, file.size);

    const fileContent = fs.readFileSync(file.path);
    const key = `${Date.now()}-${file.originalname}`;

    try {
      await s3Client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: fileContent,
          ContentType: file.mimetype,
        }),
      );

      // Clean up local temp file
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      const savedFile = await prisma.file.create({
        data: {
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          path: key, // Store S3 Key as path
          bucket: bucket,
          userId: userId,
          visibility: visibility,
        },
      });

      return savedFile;
    } catch (err) {
      // Clean up local even if upload fails
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      throw err;
    }
  },

  getFileMetadata: async (fileId: string, user?: UserContext) => {
    const file = await prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) return null;

    if (!policyService.canRead(file, user)) {
      throw new Error("Unauthorized access to file metadata");
    }

    return file;
  },

  // Returns S3 stream now
  getFileContentStream: async (fileId: string, user?: UserContext) => {
    const file = await prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) return null;

    if (!policyService.canRead(file, user)) {
      throw new Error("Unauthorized access to file content");
    }

    try {
      const command = new GetObjectCommand({
        Bucket: file.bucket,
        Key: file.path, // We stored Key in path
      });

      const response = await s3Client.send(command);
      return response.Body; // Stream
    } catch (err) {
      logger.error(`Error fetching file from S3: ${err}`);
      return null;
    }
  },

  getOptimizedImage: async (
    fileId: string,
    options: ResizeOptions,
    user?: UserContext,
  ) => {
    const file = await prisma.file.findUnique({ where: { id: fileId } });
    if (!file) return null;

    if (!policyService.canRead(file, user)) {
      throw new Error("Unauthorized access to file content");
    }

    if (!imageService.isSupportedImage(file.mimeType)) {
      throw new Error("File type not supported for optimization");
    }

    const { width, height, format } = options;
    const variantKey = `variants/${file.path}_v_${width || "auto"}_${height || "auto"}_${format || "orig"}`;

    try {
      // 1. Try to fetch from S3 cache
      const getCommand = new GetObjectCommand({
        Bucket: file.bucket,
        Key: variantKey,
      });
      const response = await s3Client.send(getCommand);
      return {
        stream: response.Body,
        contentType: `image/${format || file.mimeType.split("/")[1]}`,
      };
    } catch (err: any) {
      // 2. If not found, process and upload
      if (err.name === "NoSuchKey" || err.$metadata?.httpStatusCode === 404) {
        logger.info(`Optimized variant not found for ${fileId}, processing...`);

        // Fetch original content
        const originalCommand = new GetObjectCommand({
          Bucket: file.bucket,
          Key: file.path,
        });
        const originalResponse = await s3Client.send(originalCommand);
        const originalBuffer = await streamToBuffer(
          originalResponse.Body as Readable,
        );

        // Process image
        const { buffer: optimizedBuffer, info } =
          await imageService.processImage(originalBuffer, options);

        // Upload variant to S3
        const contentType = `image/${info.format}`;
        await s3Client.send(
          new PutObjectCommand({
            Bucket: file.bucket,
            Key: variantKey,
            Body: optimizedBuffer,
            ContentType: contentType,
          }),
        );

        // Convert buffer to stream for response
        const stream = new Readable();
        stream.push(optimizedBuffer);
        stream.push(null);

        return { stream, contentType };
      }
      throw err;
    }
  },

  deleteFile: async (fileId: string, user: UserContext) => {
    const file = await prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      throw new Error("File not found");
    }

    if (!policyService.canDelete(file, user)) {
      throw new Error("Unauthorized to delete this file");
    }

    try {
      // 1. Delete original file
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: file.bucket,
          Key: file.path,
        }),
      );

      // 2. Delete all variants (cached optimized images)
      const variantsPrefix = `variants/${file.path}_v_`;
      const listedObjects = await s3Client.send(
        new ListObjectsV2Command({
          Bucket: file.bucket,
          Prefix: variantsPrefix,
        }),
      );

      if (listedObjects.Contents && listedObjects.Contents.length > 0) {
        const deleteParams = {
          Bucket: file.bucket,
          Delete: {
            Objects: listedObjects.Contents.map((content) => ({
              Key: content.Key!,
            })),
          },
        };
        await s3Client.send(new DeleteObjectsCommand(deleteParams));
        logger.info(
          `Deleted ${listedObjects.Contents.length} variants for file ${fileId}`,
        );
      }
    } catch (err) {
      logger.error(`Failed to delete file or variants from S3: ${err}`);
      // Continue to delete from DB even if S3 fails (to avoid ghost records)
    }

    await prisma.file.delete({
      where: { id: fileId },
    });

    return true;
  },

  generateUploadUrl: async (
    bucket: string,
    originalName: string,
    mimeType: string,
    userId: string,
    visibility: FileVisibility = FileVisibility.PRIVATE,
    expiresIn: number = 3600,
  ) => {
    await ensureBucket(bucket);
    await storageService.checkQuota(userId, 0); // Check if quota is already exceeded

    const key = `${Date.now()}-${originalName}`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: mimeType,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });

    // Pre-create file record
    console.log(`Creating file record for ${key}`);
    const savedFile = await prisma.file.create({
      data: {
        originalName,
        mimeType,
        size: 0, // Unknown at this point
        path: key,
        bucket,
        userId,
        visibility,
      },
    });
    console.log(`Created file record: ${savedFile.id}`);

    return { url, fileId: savedFile.id, key };
  },

  generateDownloadUrl: async (
    fileId: string,
    user?: UserContext,
    expiresIn: number = 3600,
  ) => {
    console.log(`Generating download URL for ${fileId}`);
    const file = await prisma.file.findUnique({
      where: { id: fileId },
    });
    console.log(`Found file: ${file ? file.id : "null"}`);

    if (!file) throw new Error("File not found");

    if (!policyService.canRead(file, user)) {
      throw new Error("Unauthorized to generate download URL");
    }

    const command = new GetObjectCommand({
      Bucket: file.bucket,
      Key: file.path,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return { url };
  },
};
