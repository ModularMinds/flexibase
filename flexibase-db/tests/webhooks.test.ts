import request from "supertest";
import { app } from "../src/app";
import { prismaMock } from "../src/config/prismaMock";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("Webhooks Feature", () => {
  const adminToken = "mock-admin-token";
  const authHeader = `Bearer ${adminToken}`;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Webhook Management", () => {
    it("should create a webhook", async () => {
      mockedAxios.get.mockResolvedValue({
        data: { isSuccess: true, user: { id: "admin-1", role: "ADMIN" } },
      });
      // Mock insert returning new webhook
      const newWebhook = {
        id: "webhook-1",
        event: "INSERT",
        target_url: "http://example.com/hook",
        secret: "secret",
        is_active: true,
        created_at: new Date(),
      };
      prismaMock.$queryRawUnsafe.mockResolvedValue([newWebhook]);

      const res = await request(app)
        .post("/api/db/admin/webhooks")
        .set("Authorization", authHeader)
        .send({
          event: "INSERT",
          targetUrl: "http://example.com/hook",
          secret: "secret",
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.webhook).toEqual({
        ...newWebhook,
        created_at: newWebhook.created_at.toISOString(),
      });
    });

    it("should list webhooks", async () => {
      mockedAxios.get.mockResolvedValue({
        data: { isSuccess: true, user: { id: "admin-1", role: "ADMIN" } },
      });
      const webhooks = [
        { id: "webhook-1", event: "INSERT", created_at: new Date() },
      ];
      prismaMock.$queryRawUnsafe.mockResolvedValue(webhooks);

      const res = await request(app)
        .get("/api/db/admin/webhooks")
        .set("Authorization", authHeader);

      expect(res.statusCode).toBe(200);
      expect(res.body.webhooks).toHaveLength(1);
    });
  });

  describe("Webhook Triggers", () => {
    // We test trigger via insert-data endpoint
    it("should trigger webhook on data insertion", async () => {
      mockedAxios.get.mockResolvedValue({
        data: { isSuccess: true, user: { id: "admin-1", role: "ADMIN" } },
      });

      // Mock Access Check -> Success
      // Mock Insert -> Success
      // Mock Webhook Query -> Found 1 webhook
      // Mock Audit Log -> Success

      // Prisma mock strategy:
      // 1. validateTableAccess (queryRaw) -> [] (no error)
      // 2. audit log (executeRaw) -> 1
      // 3. fetch webhooks (queryRaw) -> [webhook]
      // 4. insert data (?) - Wait, insertData uses executeRawUnsafe?
      // insertData flow: validate (query), insert (execute), audit (execute), trigger (query).

      // We need to carefully mock responses in order.
      // Since prismaMock methods are simplistic, we might need `mockResolvedValueOnce`.

      // 1. validateTableAccess (queryRawUnsafe)
      prismaMock.$queryRawUnsafe.mockResolvedValueOnce([]);

      // 2. insertData (executeRawUnsafe)
      prismaMock.$executeRawUnsafe.mockResolvedValueOnce(1);

      // 3. audit log (executeRawUnsafe)
      prismaMock.$executeRawUnsafe.mockResolvedValueOnce(1);

      // 4. triggerWebhooks -> fetch webhooks (queryRawUnsafe)
      const webhook = {
        id: "webhook-1",
        event: "INSERT",
        target_url: "http://example.com/webhook",
        secret: "mysupersecret",
        is_active: true,
      };
      prismaMock.$queryRawUnsafe.mockResolvedValueOnce([webhook]);

      // Mock axios post for webhook call
      mockedAxios.post.mockResolvedValue({ status: 200 });

      const res = await request(app)
        .post("/api/db/crud/insert-data")
        .set("Authorization", authHeader)
        .send({
          tableName: "users",
          data: { name: "John Doe" },
        });

      expect(res.statusCode).toBe(201);

      // Verify webhook was triggered
      // Since triggerWebhooks is fire-and-forget (async), we might need a small delay or loop?
      // But in test environment with mocks, promises might resolve fast.
      // However, triggerWebhooks does NOT await axios.post inside the forEach map unless we await it.
      // implementation: webhooks.forEach(async (webhook) => { await axios.post ... })
      // This is unawaited promise in the controller.

      // To reliably test this, we should wait a bit.
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockedAxios.post).toHaveBeenCalledWith(
        "http://example.com/webhook",
        expect.objectContaining({
          event: "INSERT",
          payload: expect.anything(),
        }),
        expect.objectContaining({
          headers: expect.objectContaining({
            "X-Flexibase-Event": "INSERT",
            "X-Flexibase-Signature": expect.any(String),
          }),
        }),
      );
    });
  });
});
