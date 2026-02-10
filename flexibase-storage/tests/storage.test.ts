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

// Mock Command Classes (must be defined BEFORE they are used in the factory or inside it)
jest.mock("@aws-sdk/client-s3", () => {
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
  class MockDeleteObjectsCommand {
    constructor(public input: any) {}
  }
  class MockCreateBucketCommand {
    constructor(public input: any) {}
  }
  class MockListObjectsV2Command {
    constructor(public input: any) {}
  }

  const internalDefaultS3Mock = (command: any) => {
    if (command instanceof MockHeadBucketCommand) {
      return Promise.resolve({}); // Bucket exists
    }
    if (command instanceof MockPutObjectCommand) {
      return Promise.resolve({});
    }
    if (command instanceof MockGetObjectCommand) {
      const stream = new (require("stream").Readable)();
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
    if (command instanceof MockListObjectsV2Command) {
      return Promise.resolve({
        Contents: [{ Key: `${command.input.Prefix}w100.webp` }],
      });
    }
    if (command instanceof MockDeleteObjectsCommand) {
      return Promise.resolve({});
    }
    return Promise.resolve({});
  };

  return {
    S3Client: class MockS3Client {
      send = jest
        .fn()
        .mockImplementation((command) => internalDefaultS3Mock(command));
    },
    HeadBucketCommand: MockHeadBucketCommand,
    CreateBucketCommand: MockCreateBucketCommand,
    PutObjectCommand: MockPutObjectCommand,
    GetObjectCommand: MockGetObjectCommand,
    DeleteObjectCommand: MockDeleteObjectCommand,
    DeleteObjectsCommand: MockDeleteObjectsCommand,
    ListObjectsV2Command: MockListObjectsV2Command,
    // Store for test access
    __defaultMock: internalDefaultS3Mock,
  };
});

// Helper to get back to the default mock after overrides
const getS3DefaultMock = () =>
  (require("@aws-sdk/client-s3") as any).__defaultMock;
const mockDefaultS3Mock = getS3DefaultMock();

jest.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: jest.fn().mockResolvedValue("https://mock-presigned-url.com"),
}));

const TEST_FILE_PATH = path.join(__dirname, "testfile.txt");
const TEST_CONTENT = "Hello World Content";

beforeAll(async () => {
  try {
    // Clean up DB
    await prisma.file.deleteMany({});
    fs.writeFileSync(TEST_FILE_PATH, TEST_CONTENT);
  } catch (error) {
    console.error("Error in beforeAll:", error);
    throw error;
  }
}, 30000);

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
    (s3Client.send as jest.Mock).mockImplementation(mockDefaultS3Mock);
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
      const res = await request(app).post("/api/storage/upload-url");
      expect(res.statusCode).toBe(401);
    });

    it("should return 401 if token is invalid", async () => {
      // For this test, the mock in setup.ts will return 401 for unknown tokens
      const res = await request(app)
        .post("/api/storage/upload-url")
        .set("Authorization", "Bearer invalid-token");

      expect(res.statusCode).toBe(401);
    });
  });

  describe("Presigned URLs", () => {
    describe("POST /api/storage/upload-url", () => {
      it("should generate a presigned upload URL", async () => {
        const res = await request(app)
          .post("/api/storage/upload-url")
          .set("Authorization", adminToken)
          .send({
            bucket: "test-bucket",
            originalName: "presigned-test.txt",
            mimeType: "text/plain",
          });

        expect(res.statusCode).toBe(200);
        expect(res.body.isSuccess).toBe(true);
        expect(res.body.data).toHaveProperty("url");
        expect(res.body.data).toHaveProperty("fileId");
        expect(res.body.data).toHaveProperty("key");

        // Save fileId for subsequent tests (download url)
        fileId = res.body.data.fileId;
      });

      it("should fail validation if fields are missing", async () => {
        const res = await request(app)
          .post("/api/storage/upload-url")
          .set("Authorization", adminToken)
          .send({
            bucket: "test-bucket",
          });

        expect(res.statusCode).toBe(400);
      });
    });

    describe("GET /api/storage/files/:id/url", () => {
      it("should generate a presigned download URL", async () => {
        const res = await request(app)
          .get(`/api/storage/files/${fileId}/url`)
          .set("Authorization", adminToken);

        expect(res.statusCode).toBe(200);
        expect(res.body.isSuccess).toBe(true);
        expect(res.body.data).toHaveProperty("url");
      });

      it("should return 404 for non-existent file", async () => {
        const res = await request(app)
          .get("/api/storage/files/00000000-0000-0000-0000-000000000000/url")
          .set("Authorization", adminToken);

        expect(res.statusCode).toBe(404);
      });
    });
  });

  describe("Storage Quotas", () => {
    beforeEach(async () => {
      await prisma.file.deleteMany({});
    });

    it("should allow upload if within quota", async () => {
      const res = await request(app)
        .post("/api/storage/upload")
        .set("Authorization", adminToken)
        .field("bucket", "test-bucket")
        .attach("file", TEST_FILE_PATH);

      expect(res.statusCode).toBe(201);
    });

    it("should reject upload if quota exceeded", async () => {
      // Create a large dummy file record to exceed quota (1GB +)
      const dummy = await prisma.file.create({
        data: {
          originalName: "large_filler.bin",
          mimeType: "application/octet-stream",
          size: 1073741824 + 100, // 1GB + 100 bytes
          path: "dummy-path",
          bucket: "test-bucket",
          userId: "admin-id", // Same as adminToken mock user (matching tests/setup.ts)
        },
      });

      const res = await request(app)
        .post("/api/storage/upload")
        .set("Authorization", adminToken)
        .field("bucket", "test-bucket")
        .attach("file", TEST_FILE_PATH);

      expect(res.statusCode).toBe(500);
      expect(res.body.message).toContain("Storage quota exceeded");

      // Clean up
      await prisma.file.deleteMany({ where: { path: "dummy-path" } });
    });

    it("should reject presigned upload URL if quota exceeded", async () => {
      // Create a large dummy file record to exceed quota
      await prisma.file.create({
        data: {
          originalName: "large_filler_2.bin",
          mimeType: "application/octet-stream",
          size: 1073741824 + 100, // 1GB + 100 bytes
          path: "dummy-path-2",
          bucket: "test-bucket",
          userId: "admin-id", // Same as adminToken mock user (matching tests/setup.ts)
        },
      });

      const res = await request(app)
        .post("/api/storage/upload-url")
        .set("Authorization", adminToken)
        .send({
          bucket: "test-bucket",
          originalName: "large-file.txt",
          mimeType: "text/plain",
        });

      expect(res.statusCode).toBe(500);
      expect(res.body.message).toContain("Storage quota exceeded");

      // Clean up
      await prisma.file.deleteMany({ where: { path: "dummy-path-2" } });
    });
  });

  describe("Storage Policies", () => {
    const userToken = "Bearer mock-user-token";
    const otherUserId = "user-id"; // From tests/setup.ts

    beforeEach(async () => {
      await prisma.file.deleteMany({});
    });

    it("should allow public file access without token", async () => {
      const file = await prisma.file.create({
        data: {
          originalName: "public.txt",
          mimeType: "text/plain",
          size: 100,
          path: "public-path",
          bucket: "test-bucket",
          userId: "some-user-id",
          visibility: "PUBLIC",
        },
      });

      const res = await request(app).get(`/api/storage/files/${file.id}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.visibility).toBe("PUBLIC");
    });

    it("should reject private file access without token", async () => {
      const file = await prisma.file.create({
        data: {
          originalName: "private.txt",
          mimeType: "text/plain",
          size: 100,
          path: "private-path",
          bucket: "test-bucket",
          userId: "some-user-id",
          visibility: "PRIVATE",
        },
      });

      const res = await request(app).get(`/api/storage/files/${file.id}`);
      expect(res.statusCode).toBe(500);
      expect(res.body.message).toContain("Unauthorized");
    });

    it("should allow owner to access private file", async () => {
      const file = await prisma.file.create({
        data: {
          originalName: "owner-private.txt",
          mimeType: "text/plain",
          size: 100,
          path: "owner-path",
          bucket: "test-bucket",
          userId: "user-id", // Same as userToken mock user
          visibility: "PRIVATE",
        },
      });

      const res = await request(app)
        .get(`/api/storage/files/${file.id}`)
        .set("Authorization", userToken);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.id).toBe(file.id);
    });

    it("should allow admin to access any private file", async () => {
      const file = await prisma.file.create({
        data: {
          originalName: "other-private.txt",
          mimeType: "text/plain",
          size: 100,
          path: "other-path",
          bucket: "test-bucket",
          userId: "some-other-id",
          visibility: "PRIVATE",
        },
      });

      const res = await request(app)
        .get(`/api/storage/files/${file.id}`)
        .set("Authorization", adminToken);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.id).toBe(file.id);
    });

    it("should reject non-owner trying to delete private file", async () => {
      const file = await prisma.file.create({
        data: {
          originalName: "stays-private.txt",
          mimeType: "text/plain",
          size: 100,
          path: "stays-private-path",
          bucket: "test-bucket",
          userId: "admin-id",
          visibility: "PRIVATE",
        },
      });

      const res = await request(app)
        .delete(`/api/storage/files/${file.id}`)
        .set("Authorization", userToken);

      expect(res.statusCode).toBe(500);
      expect(res.body.message).toContain("Unauthorized");
    });
  });

  describe("Image Optimization", () => {
    it("should return optimized image when query params are provided", async () => {
      // Create an image file record
      const file = await prisma.file.create({
        data: {
          originalName: "test.png",
          mimeType: "image/png",
          size: 1000,
          path: "test-image-path",
          bucket: "test-bucket",
          userId: "admin-id",
          visibility: "PUBLIC",
        },
      });

      // Mock S3 GetObject for the original image
      // Note: We need to return a valid image buffer for sharp to not fail
      const redDotPng = Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
        "base64",
      );

      const { GetObjectCommand } = require("@aws-sdk/client-s3");
      const { s3Client } = require("../src/config/s3");

      (s3Client.send as jest.Mock).mockImplementationOnce((command) => {
        if (command instanceof GetObjectCommand) {
          return Promise.resolve({
            Body: Readable.from(redDotPng),
          });
        }
        return mockDefaultS3Mock(command);
      });

      const res = await request(app).get(
        `/api/storage/files/${file.id}/content?w=10&fmt=webp`,
      );

      expect(res.statusCode).toBe(200);
      expect(res.headers["content-type"]).toBe("image/webp");
    });

    it("should fail if optimization requested on non-image file", async () => {
      const file = await prisma.file.create({
        data: {
          originalName: "test.txt",
          mimeType: "text/plain",
          size: 100,
          path: "test-txt-path",
          bucket: "test-bucket",
          userId: "admin-id",
          visibility: "PUBLIC",
        },
      });

      const res = await request(app).get(
        `/api/storage/files/${file.id}/content?w=10`,
      );

      expect(res.statusCode).toBe(500);
      expect(res.body.message).toContain("not supported for optimization");
    });

    it("should delete variants when original file is deleted", async () => {
      const {
        ListObjectsV2Command,
        DeleteObjectsCommand,
      } = require("@aws-sdk/client-s3");
      const { s3Client } = require("../src/config/s3");

      const file = await prisma.file.create({
        data: {
          originalName: "to-delete.png",
          mimeType: "image/png",
          size: 1000,
          path: "to-delete-path",
          bucket: "test-bucket",
          userId: "admin-id",
          visibility: "PRIVATE",
        },
      });

      const res = await request(app)
        .delete(`/api/storage/files/${file.id}`)
        .set("Authorization", adminToken);

      expect(res.statusCode).toBe(200);

      // Verify S3 calls
      const calls = (s3Client.send as jest.Mock).mock.calls;
      const listCall = calls.find((c) => c[0] instanceof ListObjectsV2Command);
      const deleteObjectsCall = calls.find(
        (c) => c[0] instanceof DeleteObjectsCommand,
      );

      expect(listCall).toBeDefined();
      expect(listCall[0].input.Prefix).toContain("variants/to-delete-path_v_");
      expect(deleteObjectsCall).toBeDefined();
    });
  });
});
