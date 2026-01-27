import request from "supertest";
import { app } from "../src/app";
import { prismaMock } from "../src/config/prismaMock";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("DB CRUD Endpoints", () => {
  const userToken = "mock-user-token";
  const authHeader = `Bearer ${userToken}`;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should insert data successfully with valid token", async () => {
    prismaMock.$executeRawUnsafe.mockResolvedValue(1);
    mockedAxios.get.mockResolvedValue({
      data: { isSuccess: true, user: { id: "1", role: "USER" } },
    });

    const res = await request(app)
      .post("/api/db/crud/insert-data")
      .set("Authorization", authHeader)
      .send({
        tableName: "users",
        data: { name: "John Doe", email: "john@example.com" },
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.isSuccess).toBe(true);
  });

  it("should fail to insert data without token", async () => {
    const res = await request(app)
      .post("/api/db/crud/insert-data")
      .send({
        tableName: "users",
        data: { name: "John Doe" },
      });

    expect(res.statusCode).toBe(401);
  });

  it("should fetch data successfully with valid token", async () => {
    const mockData = [{ id: 1, name: "John Doe" }];
    prismaMock.$queryRawUnsafe.mockResolvedValue(mockData);
    mockedAxios.get.mockResolvedValue({
      data: { isSuccess: true, user: { id: "1", role: "USER" } },
    });

    const res = await request(app)
      .get("/api/db/crud/fetch-data")
      .set("Authorization", authHeader)
      .send({
        tableName: "users",
        conditions: { id: 1 },
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.isSuccess).toBe(true);
    expect(res.body.data).toEqual(mockData);
  });

  it("should fail validation if tableName is missing", async () => {
    mockedAxios.get.mockResolvedValue({
      data: { isSuccess: true, user: { id: "1", role: "USER" } },
    });

    const res = await request(app)
      .post("/api/db/crud/insert-data")
      .set("Authorization", authHeader)
      .send({
        data: { name: "John Doe" },
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.isSuccess).toBe(false);
  });
});
