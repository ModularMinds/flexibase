"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFileSchema = exports.getFileContentSchema = exports.getFileSchema = exports.uploadFileSchema = void 0;
const zod_1 = require("zod");
exports.uploadFileSchema = zod_1.z.object({
    body: zod_1.z.object({
        bucket: zod_1.z.string().optional().default("default"),
    }),
});
exports.getFileSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid("Invalid file ID"),
    }),
});
exports.getFileContentSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid("Invalid file ID"),
    }),
});
exports.deleteFileSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid("Invalid file ID"),
    }),
});
