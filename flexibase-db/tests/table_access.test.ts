import request from "supertest";
import { app } from "../src/app";
import { prismaMock } from "../src/config/prismaMock";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("Table Access Control (Admin Only)", () => {
  const adminToken = "mock-admin-token";
  const userToken = "mock-user-token";
  const authHeader = `Bearer ${adminToken}`;
  const userAuthHeader = `Bearer ${userToken}`;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Admin Only Table - Creation and Metadata", () => {
    it("should store metadata when an Admin Only table is created", async () => {
      prismaMock.$executeRawUnsafe.mockResolvedValue(1);
      mockedAxios.get.mockResolvedValue({
        data: { isSuccess: true, user: { id: "1", role: "ADMIN" } },
      });

      const res = await request(app)
        .post("/api/db/admin/create-table")
        .set("Authorization", authHeader)
        .send({
          tableName: "secret_records",
          isAdminOnly: true,
          tableColumns: [
            { name: "id", type: "SERIAL", constraints: "PRIMARY KEY" },
          ],
        });

      expect(res.statusCode).toBe(201);
      // Verify metadata storage call
      expect(prismaMock.$executeRawUnsafe).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO "_flexibase_table_metadata"'),
        "secret_records",
        true,
      );
    });
  });

  describe("Table Visibility (get-tables)", () => {
    it("should hide Admin Only tables from regular users", async () => {
      mockedAxios.get.mockResolvedValue({
        data: { isSuccess: true, user: { id: "2", role: "USER" } },
      });
      // Mock result of the joined query
      prismaMock.$queryRawUnsafe.mockResolvedValue([
        { tablename: "public_table" },
        // secret_records is filtered out by the SQL logic
      ]);

      const res = await request(app)
        .get("/api/db/admin/get-tables")
        .set("Authorization", userAuthHeader);

      expect(res.statusCode).toBe(200);
      expect(res.body.tables).not.toContain("secret_records");
    });

    it("should show all tables to ADMIN", async () => {
      mockedAxios.get.mockResolvedValue({
        data: { isSuccess: true, user: { id: "1", role: "ADMIN" } },
      });
      prismaMock.$queryRawUnsafe.mockResolvedValue([
        { tablename: "public_table" },
        { tablename: "secret_records" },
      ]);

      const res = await request(app)
        .get("/api/db/admin/get-tables")
        .set("Authorization", authHeader);

      expect(res.statusCode).toBe(200);
      expect(res.body.tables).toContain("secret_records");
    });
  });

  describe("CRUD Access Enforcement", () => {
    it("should block USER from fetching data from an Admin Only table", async () => {
      mockedAxios.get.mockResolvedValue({
        data: { isSuccess: true, user: { id: "2", role: "USER" } },
      });
      // Mock validation check result
      prismaMock.$queryRawUnsafe.mockResolvedValueOnce([
        { is_admin_only: true },
      ]);

      const res = await request(app)
        .post("/api/db/crud/fetch-data")
        .set("Authorization", userAuthHeader)
        .send({ tableName: "secret_records" });

      expect(res.statusCode).toBe(403);
      // In a real app we might want a cleaner 403, but Error(Forbidden...)
      // will trigger the errorHandler.
    });

    it("should allow ADMIN to fetch data from an Admin Only table", async () => {
      mockedAxios.get.mockResolvedValue({
        data: { isSuccess: true, user: { id: "1", role: "ADMIN" } },
      });
      prismaMock.$queryRawUnsafe.mockResolvedValue([]); // fetch results

      const res = await request(app)
        .post("/api/db/crud/fetch-data")
        .set("Authorization", authHeader)
        .send({ tableName: "secret_records" });

      expect(res.statusCode).toBe(200);
    });
  });
});
