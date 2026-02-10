"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    PORT: zod_1.z.string().default("3002"),
    DATABASE_URL: zod_1.z.string().url(),
    NODE_ENV: zod_1.z
        .enum(["development", "production", "test"])
        .default("development"),
    AUTH_SERVICE_URL: zod_1.z.string().url(),
    STORAGE_BUCKET: zod_1.z.string().default("flexibase_uploads"),
    // MinIO
    MINIO_ENDPOINT: zod_1.z.string().url().default("http://localhost:9000"),
    MINIO_ACCESS_KEY: zod_1.z.string().default("minioadmin"),
    MINIO_SECRET_KEY: zod_1.z.string().default("minioadmin"),
});
exports.env = envSchema.parse(process.env);
