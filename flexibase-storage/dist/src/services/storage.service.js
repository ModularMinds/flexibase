"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storageService = void 0;
const prisma_1 = require("../config/prisma");
const logger_1 = require("../config/logger");
const s3_1 = require("../config/s3");
const client_s3_1 = require("@aws-sdk/client-s3");
const fs_1 = __importDefault(require("fs"));
// Ensure bucket exists function
const ensureBucket = async (bucketName) => {
    try {
        await s3_1.s3Client.send(new client_s3_1.HeadBucketCommand({ Bucket: bucketName }));
    }
    catch (err) {
        // If bucket not found, create it
        if (err.name === "NotFound" || err.$metadata?.httpStatusCode === 404) {
            logger_1.logger.info(`Bucket ${bucketName} does not exist, creating...`);
            await s3_1.s3Client.send(new client_s3_1.CreateBucketCommand({ Bucket: bucketName }));
        }
        else {
            throw err;
        }
    }
};
exports.storageService = {
    uploadFile: async (file, bucket, userId) => {
        await ensureBucket(bucket);
        const fileContent = fs_1.default.readFileSync(file.path);
        const key = `${Date.now()}-${file.originalname}`;
        try {
            await s3_1.s3Client.send(new client_s3_1.PutObjectCommand({
                Bucket: bucket,
                Key: key,
                Body: fileContent,
                ContentType: file.mimetype,
            }));
            // Clean up local temp file
            if (fs_1.default.existsSync(file.path)) {
                fs_1.default.unlinkSync(file.path);
            }
            const savedFile = await prisma_1.prisma.file.create({
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
        }
        catch (err) {
            // Clean up local even if upload fails
            if (fs_1.default.existsSync(file.path))
                fs_1.default.unlinkSync(file.path);
            throw err;
        }
    },
    getFileMetadata: async (fileId) => {
        return prisma_1.prisma.file.findUnique({
            where: { id: fileId },
        });
    },
    // Returns S3 stream now
    getFileContentStream: async (fileId) => {
        const file = await prisma_1.prisma.file.findUnique({
            where: { id: fileId },
        });
        if (!file)
            return null;
        try {
            const command = new client_s3_1.GetObjectCommand({
                Bucket: file.bucket,
                Key: file.path, // We stored Key in path
            });
            const response = await s3_1.s3Client.send(command);
            return response.Body; // Stream
        }
        catch (err) {
            logger_1.logger.error(`Error fetching file from S3: ${err}`);
            return null;
        }
    },
    deleteFile: async (fileId) => {
        const file = await prisma_1.prisma.file.findUnique({
            where: { id: fileId },
        });
        if (!file) {
            throw new Error("File not found");
        }
        try {
            await s3_1.s3Client.send(new client_s3_1.DeleteObjectCommand({
                Bucket: file.bucket,
                Key: file.path,
            }));
        }
        catch (err) {
            logger_1.logger.error(`Failed to delete file from S3: ${err}`);
            // Continue to delete from DB
        }
        await prisma_1.prisma.file.delete({
            where: { id: fileId },
        });
        return true;
    },
};
