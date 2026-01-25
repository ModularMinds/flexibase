import request from "supertest";
import { app } from "../src/app";
import { prismaMock } from "../src/config/prismaMock";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("DB Advanced Querying Endpoints", () => {
  const userToken = "mock-user-token";
  const authHeader = `Bearer ${userToken}`;

  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.get.mockResolvedValue({
      data: { isSuccess: true, user: { id: "1", role: "USER" } },
    });
  });

  describe("POST /api/db/crud/fetch-data", () => {
    it("should fetch data with projections (columns)", async () => {
      prismaMock.$queryRawUnsafe.mockResolvedValue([{ name: "John Doe" }]);

      const res = await request(app)
        .post("/api/db/crud/fetch-data")
        .set("Authorization", authHeader)
        .send({
          tableName: "users",
          columns: ["name"],
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.isSuccess).toBe(true);
      expect(res.body.data[0]).toHaveProperty("name");
      expect(prismaMock.$queryRawUnsafe).toHaveBeenCalledWith(
        expect.stringContaining('SELECT "name" FROM "users"'),
      );
    });

    it("should fetch data with complex filters (operators)", async () => {
      prismaMock.$queryRawUnsafe.mockResolvedValue([]);

      const res = await request(app)
        .post("/api/db/crud/fetch-data")
        .set("Authorization", authHeader)
        .send({
          tableName: "users",
          filters: [
            { column: "age", operator: "gt", value: 25 },
            { column: "name", operator: "like", value: "J%" },
          ],
        });

      expect(res.statusCode).toBe(200);
      expect(prismaMock.$queryRawUnsafe).toHaveBeenCalledWith(
        expect.stringContaining('WHERE "age" > $1 AND "name" LIKE $2'),
        25,
        "J%",
      );
    });

    it("should fetch data with 'in' operator", async () => {
      prismaMock.$queryRawUnsafe.mockResolvedValue([]);

      const res = await request(app)
        .post("/api/db/crud/fetch-data")
        .set("Authorization", authHeader)
        .send({
          tableName: "users",
          filters: [{ column: "id", operator: "in", value: [1, 2, 3] }],
        });

      expect(res.statusCode).toBe(200);
      expect(prismaMock.$queryRawUnsafe).toHaveBeenCalledWith(
        expect.stringContaining('WHERE "id" IN ($1, $2, $3)'),
        1,
        2,
        3,
      );
    });

    it("should fetch data with sorting", async () => {
      prismaMock.$queryRawUnsafe.mockResolvedValue([]);

      const res = await request(app)
        .post("/api/db/crud/fetch-data")
        .set("Authorization", authHeader)
        .send({
          tableName: "users",
          sort: { column: "created_at", direction: "desc" },
        });

      expect(res.statusCode).toBe(200);
      expect(prismaMock.$queryRawUnsafe).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY "created_at" DESC'),
      );
    });

    it("should fetch data with pagination (limit/offset)", async () => {
      prismaMock.$queryRawUnsafe.mockResolvedValue([]);

      const res = await request(app)
        .post("/api/db/crud/fetch-data")
        .set("Authorization", authHeader)
        .send({
          tableName: "users",
          limit: 10,
          offset: 20,
        });

      expect(res.statusCode).toBe(200);
      expect(prismaMock.$queryRawUnsafe).toHaveBeenCalledWith(
        expect.stringContaining("LIMIT 10 OFFSET 20"),
      );
    });

    it("should fail validation with invalid operator", async () => {
      const res = await request(app)
        .post("/api/db/crud/fetch-data")
        .set("Authorization", authHeader)
        .send({
          tableName: "users",
          filters: [{ column: "age", operator: "invalid", value: 25 }],
        });

      expect(res.statusCode).toBe(400);
    });
  });
});
