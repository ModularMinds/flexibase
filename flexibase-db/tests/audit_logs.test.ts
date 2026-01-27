import request from "supertest";
import { app } from "../src/app";
import { prismaMock } from "../src/config/prismaMock";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("Audit Logs Feature", () => {
  const adminToken = "mock-admin-token";
  const authHeader = `Bearer ${adminToken}`;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Audit Logging", () => {
    it("should log CREATE_TABLE action", async () => {
      mockedAxios.get.mockResolvedValue({
        data: { isSuccess: true, user: { id: "admin-1", role: "ADMIN" } },
      });
      prismaMock.$executeRawUnsafe.mockResolvedValue(1);

      const res = await request(app)
        .post("/api/db/admin/create-table")
        .set("Authorization", authHeader)
        .send({
          tableName: "audit_test_table",
          tableColumns: [{ name: "id", type: "SERIAL" }],
        });

      expect(res.statusCode).toBe(201);
      // Verify logAudit called executeRawUnsafe with INSERT into audit_logs
      expect(prismaMock.$executeRawUnsafe).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO "_flexibase_audit_logs"'),
        "admin-1",
        "CREATE_TABLE",
        "audit_test_table",
        null,
        expect.any(String), // details JSON
      );
    });

    it("should log INSERT action", async () => {
      mockedAxios.get.mockResolvedValue({
        data: { isSuccess: true, user: { id: "user-1", role: "USER" } },
      });
      // Mock validation check and insert result
      prismaMock.$queryRawUnsafe.mockResolvedValue([]); // table access check
      prismaMock.$executeRawUnsafe.mockResolvedValue(1); // insert & log

      const res = await request(app)
        .post("/api/db/crud/insert-data")
        .set("Authorization", authHeader)
        .send({
          tableName: "audit_test_table",
          data: { name: "Test Item" },
        });

      expect(res.statusCode).toBe(201);
      expect(prismaMock.$executeRawUnsafe).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO "_flexibase_audit_logs"'),
        "user-1",
        "INSERT",
        "audit_test_table",
        null,
        expect.stringContaining('{"data":{"name":"Test Item"}}'),
      );
    });
  });

  describe("Get Audit Logs", () => {
    it("should allow ADMIN to fetch audit logs", async () => {
      mockedAxios.get.mockResolvedValue({
        data: { isSuccess: true, user: { id: "admin-1", role: "ADMIN" } },
      });
      const mockLogs = [
        {
          id: "log-1",
          user_id: "user-1",
          action: "INSERT",
          table_name: "test",
          timestamp: new Date(),
        },
      ];
      prismaMock.$queryRawUnsafe.mockResolvedValue(mockLogs);

      const res = await request(app)
        .get("/api/db/admin/get-audit-logs?tableName=test")
        .set("Authorization", authHeader);

      expect(res.statusCode).toBe(200);
      const expectedLogs = mockLogs.map((log) => ({
        ...log,
        timestamp: log.timestamp.toISOString(),
      }));
      expect(res.body.logs).toEqual(expectedLogs);
      expect(prismaMock.$queryRawUnsafe).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM "_flexibase_audit_logs"'),
        "test",
      );
    });

    it("should filter logs by action", async () => {
      mockedAxios.get.mockResolvedValue({
        data: { isSuccess: true, user: { id: "admin-1", role: "ADMIN" } },
      });
      prismaMock.$queryRawUnsafe.mockResolvedValue([]);

      const res = await request(app)
        .get("/api/db/admin/get-audit-logs?action=DELETE")
        .set("Authorization", authHeader);

      expect(res.statusCode).toBe(200);
      expect(prismaMock.$queryRawUnsafe).toHaveBeenCalledWith(
        expect.stringContaining("AND action = $1"),
        "DELETE",
      );
    });
  });
});
