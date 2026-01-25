import request from "supertest";
import { app } from "../src/app";
import { prismaMock } from "../src/config/prismaMock";

// I noticed app.ts doesn't export app, it just calls app.listen.
// I should refactor app.ts to export app for testing.

describe("DB CRUD Endpoints", () => {
  it("should insert data successfully", async () => {
    prismaMock.$executeRawUnsafe.mockResolvedValue(1);

    const res = await request(app)
      .post("/api/db/insert-data")
      .send({
        tableName: "users",
        data: { name: "John Doe", email: "john@example.com" },
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.isSuccess).toBe(true);
    expect(prismaMock.$executeRawUnsafe).toHaveBeenCalled();
  });

  it("should fetch data successfully", async () => {
    const mockData = [{ id: 1, name: "John Doe" }];
    prismaMock.$queryRawUnsafe.mockResolvedValue(mockData);

    const res = await request(app)
      .get("/api/db/fetch-data")
      .send({
        tableName: "users",
        conditions: { id: 1 },
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.isSuccess).toBe(true);
    expect(res.body.data).toEqual(mockData);
  });

  it("should fail validation if tableName is missing", async () => {
    const res = await request(app)
      .post("/api/db/insert-data")
      .send({
        data: { name: "John Doe" },
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.isSuccess).toBe(false);
  });
});
