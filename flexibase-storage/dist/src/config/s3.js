"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3Client = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const env_1 = require("./env");
exports.s3Client = new client_s3_1.S3Client({
    region: "us-east-1", // MinIO requires a region, though ignored if endpoint is set
    endpoint: env_1.env.MINIO_ENDPOINT,
    forcePathStyle: true, // Required for MinIO
    credentials: {
        accessKeyId: env_1.env.MINIO_ACCESS_KEY,
        secretAccessKey: env_1.env.MINIO_SECRET_KEY,
    },
});
