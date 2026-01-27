import request from "supertest";
import { app } from "../src/app";
import { prismaMock } from "../src/config/prismaMock";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("Bulk Import/Export Features", () => {
  const adminToken = "mock-admin-token";
  const authHeader = `Bearer ${adminToken}`;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Import Data", () => {
    it("should import JSON data successfully", async () => {
      mockedAxios.get.mockResolvedValue({
        data: { isSuccess: true, user: { id: "admin-1", role: "ADMIN" } },
      });
      prismaMock.$queryRawUnsafe.mockResolvedValue([]); // access check
      prismaMock.$executeRawUnsafe.mockResolvedValue(1); // insert
      // We also mock the audit log insert which uses executeRawUnsafe
      // So executeRawUnsafe is called twice

      const buffer = Buffer.from(
        JSON.stringify([{ name: "Item 1" }, { name: "Item 2" }]),
      );

      const res = await request(app)
        .post("/api/db/crud/import-data")
        .set("Authorization", authHeader)
        .field("tableName", "test_table")
        .attach("file", buffer, "data.json");

      expect(res.statusCode).toBe(200);
      expect(prismaMock.$executeRawUnsafe).toHaveBeenCalledTimes(2); // Insert + Audit
    });

    it("should import CSV data successfully", async () => {
      mockedAxios.get.mockResolvedValue({
        data: { isSuccess: true, user: { id: "admin-1", role: "ADMIN" } },
      });
      prismaMock.$queryRawUnsafe.mockResolvedValue([]);
      prismaMock.$executeRawUnsafe.mockResolvedValue(1);

      const buffer = Buffer.from("name,age\nAlice,30\nBob,25");

      const res = await request(app)
        .post("/api/db/crud/import-data")
        .set("Authorization", authHeader)
        .field("tableName", "test_table")
        .attach("file", buffer, "data.csv");

      expect(res.statusCode).toBe(200);
      expect(prismaMock.$executeRawUnsafe).toHaveBeenCalledTimes(2);
    });
  });

  describe("Export Data", () => {
    it("should export data as JSON", async () => {
      mockedAxios.get.mockResolvedValue({
        data: { isSuccess: true, user: { id: "admin-1", role: "ADMIN" } },
      });
      const mockData = [{ id: 1, name: "Test" }];
      prismaMock.$queryRawUnsafe.mockResolvedValue(mockData);

      const res = await request(app)
        .get("/api/db/crud/export-data?tableName=test_table&format=json")
        .set("Authorization", authHeader);

      expect(res.statusCode).toBe(200);
      expect(res.header["content-type"]).toContain("application/json");
      expect(res.body).toEqual(mockData);
    });

    it("should export data as CSV", async () => {
      mockedAxios.get.mockResolvedValue({
        data: { isSuccess: true, user: { id: "admin-1", role: "ADMIN" } },
      });
      const mockData = [{ id: 1, name: "Test" }];
      prismaMock.$queryRawUnsafe.mockResolvedValue(mockData);

      const res = await request(app)
        .get("/api/db/crud/export-data?tableName=test_table&format=csv")
        .set("Authorization", authHeader);

      expect(res.statusCode).toBe(200);
      expect(res.header["content-type"]).toContain("text/csv");
      expect(res.text).toContain('"id","name"');
      expect(res.text).toContain('1,"Test"');
    });
  });
});
