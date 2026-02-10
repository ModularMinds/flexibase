"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFileController = exports.getFileContentController = exports.getFileMetadataController = exports.uploadFileController = void 0;
const storage_service_1 = require("../services/storage.service");
const stream_1 = require("stream");
const uploadFileController = async (req, res, next) => {
    try {
        const file = req.file;
        if (!file) {
            res.status(400).json({ isSuccess: false, message: "No file provided" });
            return;
        }
        const { bucket } = req.body;
        const user = req.user;
        const result = await storage_service_1.storageService.uploadFile(file, bucket || "default", user.id);
        res.status(201).json({
            isSuccess: true,
            data: result,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.uploadFileController = uploadFileController;
const getFileMetadataController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const file = await storage_service_1.storageService.getFileMetadata(id);
        if (!file) {
            res.status(404).json({ isSuccess: false, message: "File not found" });
            return;
        }
        res.status(200).json({
            isSuccess: true,
            data: file,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getFileMetadataController = getFileMetadataController;
const getFileContentController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const stream = await storage_service_1.storageService.getFileContentStream(id);
        if (!stream) {
            res
                .status(404)
                .json({ isSuccess: false, message: "File not found or S3 error" });
            return;
        }
        // Handle AWS SDK v3 stream type (Readable | ReadableStream | Blob)
        // For Node.js, we expect Readable
        if (stream instanceof stream_1.Readable) {
            stream.pipe(res);
        }
        else {
            // Best effort conversion or direct handling if it's a web stream (node 18+)
            // @ts-ignore
            if (typeof stream.pipe === "function") {
                // @ts-ignore
                stream.pipe(res);
            }
            else {
                // Fallback for ByteArray or other types (not common in Node environment for GetObject)
                const bytes = await stream.transformToByteArray();
                res.send(Buffer.from(bytes));
            }
        }
    }
    catch (err) {
        next(err);
    }
};
exports.getFileContentController = getFileContentController;
const deleteFileController = async (req, res, next) => {
    try {
        const { id } = req.params;
        await storage_service_1.storageService.deleteFile(id);
        res.status(200).json({
            isSuccess: true,
            message: "File deleted successfully",
        });
    }
    catch (err) {
        if (err.message === "File not found") {
            res.status(404).json({ isSuccess: false, message: "File not found" });
            return;
        }
        next(err);
    }
};
exports.deleteFileController = deleteFileController;
