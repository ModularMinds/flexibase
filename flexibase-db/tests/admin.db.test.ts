import request from "supertest";
import { app } from "../src/app";
import { prismaMock } from "../src/config/prismaMock";

describe("DB Admin Endpoints", () => {
  const adminCreds = Buffer.from("admin:password").toString("base64");
  const authHeader = `Basic ${adminCreds}`;

  beforeAll(() => {
    process.env.FLEXIBASE_ADMIN_USER = "admin";
    process.env.FLEXIBASE_ADMIN_PASSWORD = "password";
  });

  it("should create table successfully with valid admin creds", async () => {
    prismaMock.$executeRawUnsafe.mockResolvedValue(1);

    const res = await request(app)
      .post("/api/db/admin/create-table")
      .set("Authorization", authHeader)
      .send({
        tableName: "new_table",
        tableColumns: [{ name: "id", type: "SERIAL PRIMARY KEY" }],
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.isSuccess).toBe(true);
  });

  it("should fail to create table with invalid admin creds", async () => {
    const res = await request(app)
      .post("/api/db/admin/create-table")
      .set("Authorization", "Basic wrongcreds")
      .send({
        tableName: "new_table",
        tableColumns: [{ name: "id", type: "SERIAL" }],
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.isSuccess).toBe(false);
  });

  it("should delete table successfully", async () => {
    prismaMock.$executeRawUnsafe.mockResolvedValue(1);

    const res = await request(app)
      .delete("/api/db/admin/delete-table")
      .set("Authorization", authHeader)
      .send({
        tableName: "old_table",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.isSuccess).toBe(true);
  });

  it("should get all tables", async () => {
    prismaMock.$queryRawUnsafe.mockResolvedValue([{ tablename: "users" }]);

    const res = await request(app)
      .get("/api/db/admin/get-tables")
      .set("Authorization", authHeader);

    expect(res.statusCode).toBe(200);
    expect(res.body.tables).toContain("users");
  });
});
