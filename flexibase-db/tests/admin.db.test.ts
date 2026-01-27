import request from "supertest";
import { app } from "../src/app";
import { prismaMock } from "../src/config/prismaMock";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("DB Admin Endpoints", () => {
  const adminToken = "mock-admin-token";
  const userToken = "mock-user-token";
  const authHeader = `Bearer ${adminToken}`;
  const userAuthHeader = `Bearer ${userToken}`;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create table successfully with ADMIN role", async () => {
    prismaMock.$executeRawUnsafe.mockResolvedValue(1);
    mockedAxios.get.mockResolvedValue({
      data: { isSuccess: true, user: { id: "1", role: "ADMIN" } },
    });

    const res = await request(app)
      .post("/api/db/admin/create-table")
      .set("Authorization", authHeader)
      .send({
        tableName: "new_table",
        tableColumns: [
          { name: "id", type: "SERIAL", constraints: "PRIMARY KEY" },
        ],
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.isSuccess).toBe(true);
  });

  it("should fail to create table with USER role", async () => {
    mockedAxios.get.mockResolvedValue({
      data: { isSuccess: true, user: { id: "2", role: "USER" } },
    });

    const res = await request(app)
      .post("/api/db/admin/create-table")
      .set("Authorization", userAuthHeader)
      .send({
        tableName: "new_table",
        tableColumns: [{ name: "id", type: "SERIAL" }],
      });

    expect(res.statusCode).toBe(403);
    expect(res.body.isSuccess).toBe(false);
  });

  it("should fail to create table without token", async () => {
    const res = await request(app)
      .post("/api/db/admin/create-table")
      .send({
        tableName: "new_table",
        tableColumns: [{ name: "id", type: "SERIAL" }],
      });

    expect(res.statusCode).toBe(401);
  });

  it("should delete table successfully with ADMIN role", async () => {
    prismaMock.$executeRawUnsafe.mockResolvedValue(1);
    mockedAxios.get.mockResolvedValue({
      data: { isSuccess: true, user: { id: "1", role: "ADMIN" } },
    });

    const res = await request(app)
      .delete("/api/db/admin/delete-table")
      .set("Authorization", authHeader)
      .send({
        tableName: "old_table",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.isSuccess).toBe(true);
  });

  it("should get all tables with ADMIN role", async () => {
    prismaMock.$queryRawUnsafe.mockResolvedValue([{ tablename: "users" }]);
    mockedAxios.get.mockResolvedValue({
      data: { isSuccess: true, user: { id: "1", role: "ADMIN" } },
    });

    const res = await request(app)
      .get("/api/db/admin/get-tables")
      .set("Authorization", authHeader);

    expect(res.statusCode).toBe(200);
    expect(res.body.tables).toContain("users");
  });
});
