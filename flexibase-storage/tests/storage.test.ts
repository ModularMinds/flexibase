import request from "supertest";
import path from "path";
import fs from "fs";
import { app } from "../src/app";
import { prisma } from "../src/config/prisma";
import { Readable } from "stream";
import { s3Client } from "../src/config/s3";
import axios from "axios";

// Mock Axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock S3 Client
jest.mock("@aws-sdk/client-s3", () => {
  class MockS3Client {
    send = jest.fn().mockImplementation((command) => {
      if (command instanceof MockHeadBucketCommand) {
        return Promise.resolve({}); // Bucket exists
      }
      if (command instanceof MockPutObjectCommand) {
        return Promise.resolve({});
      }
      if (command instanceof MockGetObjectCommand) {
        const stream = new Readable();
        stream.push("Hello World Content");
        stream.push(null);
        return Promise.resolve({ Body: stream });
      }
      if (command instanceof MockDeleteObjectCommand) {
        return Promise.resolve({});
      }
      if (command instanceof MockCreateBucketCommand) {
        return Promise.resolve({});
      }
      return Promise.resolve({});
    });
  }

  class MockHeadBucketCommand {
    constructor(public input: any) {}
  }
  class MockPutObjectCommand {
    constructor(public input: any) {}
  }
  class MockGetObjectCommand {
    constructor(public input: any) {}
  }
  class MockDeleteObjectCommand {
    constructor(public input: any) {}
  }
  class MockCreateBucketCommand {
    constructor(public input: any) {}
  }

  return {
    S3Client: MockS3Client,
    HeadBucketCommand: MockHeadBucketCommand,
    CreateBucketCommand: MockCreateBucketCommand,
    PutObjectCommand: MockPutObjectCommand,
    GetObjectCommand: MockGetObjectCommand,
    DeleteObjectCommand: MockDeleteObjectCommand,
  };
});

const TEST_FILE_PATH = path.join(__dirname, "testfile.txt");
const TEST_CONTENT = "Hello World Content";

beforeAll(async () => {
  // Clean up DB
  await prisma.file.deleteMany({});
  fs.writeFileSync(TEST_FILE_PATH, TEST_CONTENT);
});

afterAll(async () => {
  await prisma.$disconnect();
  if (fs.existsSync(TEST_FILE_PATH)) fs.unlinkSync(TEST_FILE_PATH);
});

describe("Storage Service Integration Tests", () => {
  let fileId: string;
  const adminToken = "Bearer mock-admin-token";

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    // Default Axios Success
    mockedAxios.get.mockResolvedValue({
      data: {
        isSuccess: true,
        user: { id: "admin-user", role: "admin" },
      },
    });
  });

  describe("POST /api/storage/upload", () => {
    it("should upload a file successfully to S3", async () => {
      const res = await request(app)
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

    it("should fail if no file is attached", async () => {
      const res = await request(app)
        .post("/api/storage/upload")
        .set("Authorization", adminToken)
        .field("bucket", "test-bucket");

      expect(res.statusCode).toBe(400);
    });

    it("should handle S3 upload failure", async () => {
      // Mock S3 failure once
      (s3Client.send as jest.Mock).mockRejectedValueOnce(
        new Error("S3 Upload Failed"),
      );

      const res = await request(app)
        .post("/api/storage/upload")
        .set("Authorization", adminToken)
        .field("bucket", "test-bucket")
        .attach("file", TEST_FILE_PATH);

      expect(res.statusCode).toBe(500);
    });
  });

  describe("GET /api/storage/files/:id", () => {
    it("should retrieve file metadata", async () => {
      const res = await request(app)
        .get(`/api/storage/files/${fileId}`)
        .set("Authorization", adminToken);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.id).toBe(fileId);
    });

    it("should return 404 for non-existent file", async () => {
      const res = await request(app)
        .get("/api/storage/files/00000000-0000-0000-0000-000000000000")
        .set("Authorization", adminToken);

      expect(res.statusCode).toBe(404);
    });
  });

  describe("GET /api/storage/files/:id/content", () => {
    it("should download file content from S3 stream", async () => {
      const res = await request(app)
        .get(`/api/storage/files/${fileId}/content`)
        .set("Authorization", adminToken);

      expect(res.statusCode).toBe(200);
      expect(res.text).toBe(TEST_CONTENT);
    });

    it("should return 404 for non-existent file", async () => {
      const res = await request(app)
        .get("/api/storage/files/00000000-0000-0000-0000-000000000000/content")
        .set("Authorization", adminToken);

      expect(res.statusCode).toBe(404);
    });

    it("should handle S3 download error (e.g. file missing in S3)", async () => {
      // Mock S3 failure once
      (s3Client.send as jest.Mock).mockRejectedValueOnce(new Error("S3 Error"));

      const res = await request(app)
        .get(`/api/storage/files/${fileId}/content`)
        .set("Authorization", adminToken);

      // Service returns null on error, controller returns 404
      expect(res.statusCode).toBe(404);
    });
  });

  describe("DELETE /api/storage/files/:id", () => {
    it("should return 404 if file not found", async () => {
      const res = await request(app)
        .delete("/api/storage/files/00000000-0000-0000-0000-000000000000")
        .set("Authorization", adminToken);

      expect(res.statusCode).toBe(404);
    });

    it("should delete file from DB and S3", async () => {
      const res = await request(app)
        .delete(`/api/storage/files/${fileId}`)
        .set("Authorization", adminToken);

      expect(res.statusCode).toBe(200);
    });

    it("should verify deletion from DB", async () => {
      const res = await request(app)
        .get(`/api/storage/files/${fileId}`)
        .set("Authorization", adminToken);

      expect(res.statusCode).toBe(404);
    });
  });

  describe("Unauthorized Access", () => {
    it("should return 401 if no token provided", async () => {
      const res = await request(app).get(`/api/storage/files/${fileId}`);
      expect(res.statusCode).toBe(401);
    });

    it("should return 401 if token is invalid", async () => {
      mockedAxios.get.mockRejectedValueOnce({ response: { status: 401 } });

      const res = await request(app)
        .get(`/api/storage/files/${fileId}`)
        .set("Authorization", "Bearer invalid-token");

      expect(res.statusCode).toBe(401);
    });
  });
});
