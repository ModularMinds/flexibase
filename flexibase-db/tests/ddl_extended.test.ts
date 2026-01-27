import request from "supertest";
import { app } from "../src/app";
import { prismaMock } from "../src/config/prismaMock";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("DB Extended DDL Endpoints", () => {
  const adminToken = "mock-admin-token";
  const userToken = "mock-user-token";
  const authHeader = `Bearer ${adminToken}`;
  const userAuthHeader = `Bearer ${userToken}`;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("PATCH /api/db/admin/alter-table", () => {
    it("should alter table successfully with ADMIN role (ADD column)", async () => {
      prismaMock.$executeRawUnsafe.mockResolvedValue(1);
      mockedAxios.get.mockResolvedValue({
        data: { isSuccess: true, user: { id: "1", role: "ADMIN" } },
      });

      const res = await request(app)
        .patch("/api/db/admin/alter-table")
        .set("Authorization", authHeader)
        .send({
          tableName: "users",
          action: "ADD",
          column: { name: "bio", type: "TEXT" },
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.isSuccess).toBe(true);
      expect(prismaMock.$executeRawUnsafe).toHaveBeenCalledWith(
        expect.stringContaining('ALTER TABLE "users" ADD COLUMN "bio" TEXT'),
      );
    });

    it("should fail to alter table with USER role", async () => {
      mockedAxios.get.mockResolvedValue({
        data: { isSuccess: true, user: { id: "2", role: "USER" } },
      });

      const res = await request(app)
        .patch("/api/db/admin/alter-table")
        .set("Authorization", userAuthHeader)
        .send({
          tableName: "users",
          action: "ADD",
          column: { name: "bio", type: "TEXT" },
        });

      expect(res.statusCode).toBe(403);
    });

    it("should fail validation if column type is missing for ADD", async () => {
      mockedAxios.get.mockResolvedValue({
        data: { isSuccess: true, user: { id: "1", role: "ADMIN" } },
      });

      const res = await request(app)
        .patch("/api/db/admin/alter-table")
        .set("Authorization", authHeader)
        .send({
          tableName: "users",
          action: "ADD",
          column: { name: "bio" },
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe("POST /api/db/admin/create-index", () => {
    it("should create index successfully with ADMIN role", async () => {
      prismaMock.$executeRawUnsafe.mockResolvedValue(1);
      mockedAxios.get.mockResolvedValue({
        data: { isSuccess: true, user: { id: "1", role: "ADMIN" } },
      });

      const res = await request(app)
        .post("/api/db/admin/create-index")
        .set("Authorization", authHeader)
        .send({
          tableName: "users",
          indexName: "idx_user_email",
          columns: ["email"],
          unique: true,
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.isSuccess).toBe(true);
      expect(prismaMock.$executeRawUnsafe).toHaveBeenCalledWith(
        expect.stringContaining(
          'CREATE UNIQUE INDEX "idx_user_email" ON "users" ("email")',
        ),
      );
    });

    it("should fail to create index with USER role", async () => {
      mockedAxios.get.mockResolvedValue({
        data: { isSuccess: true, user: { id: "2", role: "USER" } },
      });

      const res = await request(app)
        .post("/api/db/admin/create-index")
        .set("Authorization", userAuthHeader)
        .send({
          tableName: "users",
          indexName: "idx_user_email",
          columns: ["email"],
        });

      expect(res.statusCode).toBe(403);
    });
  });
});
