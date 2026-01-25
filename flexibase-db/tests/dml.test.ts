import request from "supertest";
import { app } from "../src/app";
import { prismaMock } from "../src/config/prismaMock";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("DB DML Endpoints", () => {
  const userToken = "mock-user-token";
  const authHeader = `Bearer ${userToken}`;

  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.get.mockResolvedValue({
      data: { isSuccess: true, user: { id: "1", role: "USER" } },
    });
  });

  describe("PATCH /api/db/crud/update-data", () => {
    it("should update data successfully", async () => {
      prismaMock.$executeRawUnsafe.mockResolvedValue(1);

      const res = await request(app)
        .patch("/api/db/crud/update-data")
        .set("Authorization", authHeader)
        .send({
          tableName: "users",
          data: { name: "Jane Doe" },
          conditions: { id: 1 },
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.isSuccess).toBe(true);
      expect(prismaMock.$executeRawUnsafe).toHaveBeenCalled();
    });

    it("should fail validation if missing conditions", async () => {
      const res = await request(app)
        .patch("/api/db/crud/update-data")
        .set("Authorization", authHeader)
        .send({
          tableName: "users",
          data: { name: "Jane Doe" },
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe("DELETE /api/db/crud/delete-data", () => {
    it("should delete data successfully", async () => {
      prismaMock.$executeRawUnsafe.mockResolvedValue(1);

      const res = await request(app)
        .delete("/api/db/crud/delete-data")
        .set("Authorization", authHeader)
        .send({
          tableName: "users",
          conditions: { id: 1 },
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.isSuccess).toBe(true);
      expect(prismaMock.$executeRawUnsafe).toHaveBeenCalled();
    });
  });

  describe("POST /api/db/crud/upsert-data", () => {
    it("should upsert data successfully", async () => {
      prismaMock.$executeRawUnsafe.mockResolvedValue(1);

      const res = await request(app)
        .post("/api/db/crud/upsert-data")
        .set("Authorization", authHeader)
        .send({
          tableName: "users",
          data: { id: 1, name: "John Upsert" },
          conflictColumns: ["id"],
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.isSuccess).toBe(true);
      expect(prismaMock.$executeRawUnsafe).toHaveBeenCalled();
    });
  });
});
