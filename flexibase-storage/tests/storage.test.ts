import request from "supertest";
import path from "path";
import fs from "fs";
import { app } from "../src/app";
import { prisma } from "../src/config/prisma";

const TEST_FILE_PATH = path.join(__dirname, "testfile.txt");
const TEST_CONTENT = "Hello World Content";

beforeAll(async () => {
  // Clean up DB
  await prisma.file.deleteMany();
  fs.writeFileSync(TEST_FILE_PATH, TEST_CONTENT);
});

afterAll(async () => {
  await prisma.$disconnect();
  if (fs.existsSync(TEST_FILE_PATH)) fs.unlinkSync(TEST_FILE_PATH);
});

describe("Storage Service Integration Tests", () => {
  let fileId: string;
  const adminToken = "Bearer mock-admin-token";

  describe("POST /api/storage/upload", () => {
    it("should upload a file successfully", async () => {
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

    it("should fail without file", async () => {
      const res = await request(app)
        .post("/api/storage/upload")
        .set("Authorization", adminToken);

      expect(res.statusCode).toBe(400); // 400 from controller? Or Multer?
      // Controller checks if (!file) -> 400
    });

    it("should fail without auth", async () => {
      const res = await request(app)
        .post("/api/storage/upload")
        .attach("file", TEST_FILE_PATH);

      expect(res.statusCode).toBe(401);
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
        .get(`/api/storage/files/00000000-0000-0000-0000-000000000000`)
        .set("Authorization", adminToken);

      expect(res.statusCode).toBe(404);
    });
  });

  describe("GET /api/storage/files/:id/content", () => {
    it("should download file content", async () => {
      const res = await request(app)
        .get(`/api/storage/files/${fileId}/content`)
        .set("Authorization", adminToken);

      expect(res.statusCode).toBe(200);
      expect(res.text).toBe(TEST_CONTENT);
    });
  });

  describe("DELETE /api/storage/files/:id", () => {
    it("should delete file", async () => {
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
});
