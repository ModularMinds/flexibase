import request from "supertest";
import { app } from "../src/app";
import { prismaMock } from "../src/config/prismaMock";

describe("Transaction Feature", () => {
  const adminToken = "mock-admin-token";
  const authHeader = `Bearer ${adminToken}`;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should execute a batch of operations successfully", async () => {
    // Mock access check (for 2 operations, separate queries)
    prismaMock.$queryRawUnsafe.mockResolvedValue([]);

    // Mock transaction execution
    // $transaction returns an array of results
    prismaMock.$transaction.mockResolvedValue([1, 1]); // 1 row affected each

    const res = await request(app)
      .post("/api/db/crud/transaction")
      .set("Authorization", authHeader)
      .send({
        operations: [
          {
            type: "INSERT",
            tableName: "users",
            data: { name: "Alice" },
          },
          {
            type: "UPDATE",
            tableName: "accounts",
            data: { balance: 100 },
            conditions: { userId: 1 },
          },
        ],
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.isSuccess).toBe(true);
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);

    // Verify arguments passed to $executeRawUnsafe inside the transaction logic
    // We can't easily spy on the generated promises, but we can check if executeRawUnsafe was called to generate them.
    // The controller calls executeRawUnsafe to create the promises.
    expect(prismaMock.$executeRawUnsafe).toHaveBeenCalledTimes(2);
    // First call for INSERT
    expect(prismaMock.$executeRawUnsafe).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO"),
      "Alice",
    );
    // Second call for UPDATE
    expect(prismaMock.$executeRawUnsafe).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE"),
      100, // balance
      1, // userId condition
    );
  });

  it("should fail if any table access validation fails", async () => {
    // Mock access check failure
    prismaMock.$queryRawUnsafe.mockRejectedValue(new Error("Access Denied"));

    const res = await request(app)
      .post("/api/db/crud/transaction")
      .set("Authorization", authHeader)
      .send({
        operations: [
          { type: "INSERT", tableName: "secrets", data: { foo: "bar" } },
        ],
      });

    expect(res.statusCode).toBe(500); // or 403 depending on how middleware/error handler wraps it
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });
});
