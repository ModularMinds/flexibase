import request from "supertest";
import { app } from "../src/app";
import { prismaMock } from "../src/config/prismaMock";
import { cacheService } from "../src/services/cache.service";

// Mock cacheService
jest.mock("../src/services/cache.service", () => ({
  cacheService: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    invalidatePattern: jest.fn(),
  },
}));

describe("Caching Feature", () => {
  const adminToken = "mock-admin-token";
  const authHeader = `Bearer ${adminToken}`;
  const mockedCache = cacheService as jest.Mocked<typeof cacheService>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Fetch Data Caching", () => {
    it("should return cached data if available", async () => {
      // Mock cache hit
      const cachedData = [{ id: 1, name: "Cached User" }];
      mockedCache.get.mockResolvedValue(cachedData);

      const res = await request(app)
        .post("/api/db/crud/fetch-data")
        .set("Authorization", authHeader)
        .send({ tableName: "users" });

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toEqual(cachedData);
      expect(res.body.source).toBe("cache");
      expect(prismaMock.$queryRawUnsafe).not.toHaveBeenCalled();
    });

    it("should query database and set cache on miss", async () => {
      // Mock cache miss
      mockedCache.get.mockResolvedValue(null);
      // Mock DB result
      const dbData = [{ id: 1, name: "DB User" }];
      prismaMock.$queryRawUnsafe.mockResolvedValue(dbData);
      prismaMock.$queryRawUnsafe.mockResolvedValueOnce([]); // Access check

      // Note: validateTableAccess calls queryRawUndsafe.
      // So we expect at least 1 call for access check + 1 for data.
      // But my mockAccess setup in previous tests usually handles validation validation.
      // Here I need to be careful with prismaMock behavior.

      const res = await request(app)
        .post("/api/db/crud/fetch-data")
        .set("Authorization", authHeader)
        .send({ tableName: "users" });

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toEqual(dbData);
      expect(res.body.source).toBe("database");
      expect(mockedCache.set).toHaveBeenCalledTimes(1);
    });
  });

  describe("Cache Invalidation", () => {
    it("should invalidate cache on INSERT", async () => {
      prismaMock.$executeRawUnsafe.mockResolvedValue(1); // Insert success
      prismaMock.$executeRawUnsafe.mockResolvedValue(1); // Audit success

      const res = await request(app)
        .post("/api/db/crud/insert-data")
        .set("Authorization", authHeader)
        .send({ tableName: "users", data: { name: "New" } });

      expect(res.statusCode).toBe(201);
      expect(mockedCache.invalidatePattern).toHaveBeenCalledWith(
        "data:users:*",
      );
    });
  });
});
