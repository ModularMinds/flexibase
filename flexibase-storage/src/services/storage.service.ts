import { prisma } from "../config/prisma";
import { env } from "../config/env";
import { logger } from "../config/logger";
import { s3Client } from "../config/s3";
import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
} from "@aws-sdk/client-s3";
import fs from "fs";

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

export const storageService = {
  uploadFile: async (
    file: Express.Multer.File,
    bucket: string,
    userId: string,
  ) => {
    await ensureBucket(bucket);

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
        },
      });

      return savedFile;
    } catch (err) {
      // Clean up local even if upload fails
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      throw err;
    }
  },

  getFileMetadata: async (fileId: string) => {
    return prisma.file.findUnique({
      where: { id: fileId },
    });
  },

  // Returns S3 stream now
  getFileContentStream: async (fileId: string) => {
    const file = await prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) return null;

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

  deleteFile: async (fileId: string) => {
    const file = await prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      throw new Error("File not found");
    }

    try {
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: file.bucket,
          Key: file.path,
        }),
      );
    } catch (err) {
      logger.error(`Failed to delete file from S3: ${err}`);
      // Continue to delete from DB
    }

    await prisma.file.delete({
      where: { id: fileId },
    });

    return true;
  },
};
