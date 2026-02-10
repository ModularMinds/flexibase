"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const app_1 = require("../src/app");
const prisma_1 = require("../src/config/prisma");
const stream_1 = require("stream");
// Mock S3 Client
jest.mock("@aws-sdk/client-s3", () => {
    return {
        S3Client: jest.fn(() => ({
            send: jest.fn().mockImplementation((command) => {
                if (command.constructor.name === "HeadBucketCommand") {
                    return Promise.resolve({}); // Bucket exists
                }
                if (command.constructor.name === "PutObjectCommand") {
                    return Promise.resolve({});
                }
                if (command.constructor.name === "GetObjectCommand") {
                    const stream = new stream_1.Readable();
                    stream.push("Hello World Content");
                    stream.push(null);
                    return Promise.resolve({ Body: stream });
                }
                if (command.constructor.name === "DeleteObjectCommand") {
                    return Promise.resolve({});
                }
                return Promise.resolve({});
            }),
        })),
        HeadBucketCommand: jest.fn(),
        CreateBucketCommand: jest.fn(),
        PutObjectCommand: jest.fn(),
        GetObjectCommand: jest.fn(),
        DeleteObjectCommand: jest.fn(),
    };
});
const TEST_FILE_PATH = path_1.default.join(__dirname, "testfile.txt");
const TEST_CONTENT = "Hello World Content";
beforeAll(async () => {
    // Clean up DB
    await prisma_1.prisma.file.deleteMany();
    fs_1.default.writeFileSync(TEST_FILE_PATH, TEST_CONTENT);
});
afterAll(async () => {
    await prisma_1.prisma.$disconnect();
    if (fs_1.default.existsSync(TEST_FILE_PATH))
        fs_1.default.unlinkSync(TEST_FILE_PATH);
});
describe("Storage Service Integration Tests", () => {
    let fileId;
    const adminToken = "Bearer mock-admin-token";
    describe("POST /api/storage/upload", () => {
        it("should upload a file successfully to S3", async () => {
            const res = await (0, supertest_1.default)(app_1.app)
                .post("/api/storage/upload")
                .set("Authorization", adminToken)
                .field("bucket", "test-bucket")
                .attach("file", TEST_FILE_PATH);
            expect(res.statusCode).toBe(201);
            expect(res.body.isSuccess).toBe(true);
            expect(res.body.data).toHaveProperty("id");
            expect(res.body.data.originalName).toBe("testfile.txt");
            fileId = res.body.data.id;
        });
    });
    describe("GET /api/storage/files/:id", () => {
        it("should retrieve file metadata", async () => {
            const res = await (0, supertest_1.default)(app_1.app)
                .get(`/api/storage/files/${fileId}`)
                .set("Authorization", adminToken);
            expect(res.statusCode).toBe(200);
            expect(res.body.data.id).toBe(fileId);
        });
    });
    describe("GET /api/storage/files/:id/content", () => {
        it("should download file content from S3 stream", async () => {
            const res = await (0, supertest_1.default)(app_1.app)
                .get(`/api/storage/files/${fileId}/content`)
                .set("Authorization", adminToken);
            expect(res.statusCode).toBe(200);
            expect(res.text).toBe(TEST_CONTENT);
        });
    });
    describe("DELETE /api/storage/files/:id", () => {
        it("should delete file from DB and S3", async () => {
            const res = await (0, supertest_1.default)(app_1.app)
                .delete(`/api/storage/files/${fileId}`)
                .set("Authorization", adminToken);
            expect(res.statusCode).toBe(200);
        });
        it("should verify deletion from DB", async () => {
            const res = await (0, supertest_1.default)(app_1.app)
                .get(`/api/storage/files/${fileId}`)
                .set("Authorization", adminToken);
            expect(res.statusCode).toBe(404);
        });
    });
});
