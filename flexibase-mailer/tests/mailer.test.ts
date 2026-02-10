import request from "supertest";
import { app } from "../src/app";
import axios from "axios";
import { mailQueue } from "../src/queue/mail.queue";
import { templateService } from "../src/services/template.service";
import fs from "fs";
import path from "path";

// Mock Axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock BullMQ Queue
jest.mock("../src/queue/mail.queue", () => ({
  mailQueue: {
    add: jest.fn().mockResolvedValue({ id: "mock-job-id" }),
  },
}));

// Mock Template Service
jest.mock("../src/services/template.service", () => ({
  templateService: {
    render: jest.fn().mockResolvedValue("<html>Rendered</html>"),
  },
}));

describe("Mailer Service Integration Tests", () => {
  const authToken = "Bearer mock-token";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/mailer/send", () => {
    it("should enqueue email successfully with valid token and payload", async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { isSuccess: true, user: { id: "user-123", role: "ADMIN" } },
      });

      const res = await request(app)
        .post("/api/mailer/send")
        .set("Authorization", authToken)
        .field("to", "test@example.com")
        .field("subject", "Test Subject")
        .field("text", "Hello World");

      expect(res.statusCode).toBe(202);
      expect(res.body.isSuccess).toBe(true);
      expect(res.body.data.jobId).toBe("mock-job-id");
      expect(mailQueue.add).toHaveBeenCalledWith(
        "send-mail",
        expect.objectContaining({
          to: "test@example.com",
          subject: "Test Subject",
        }),
      );
    });

    it("should handle templates correctly", async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { isSuccess: true, user: { id: "user-123" } },
      });

      const res = await request(app)
        .post("/api/mailer/send")
        .set("Authorization", authToken)
        .field("to", "test@example.com")
        .field("subject", "Template Test")
        .field("templateId", "welcome")
        .field("templateContext", JSON.stringify({ name: "John" }));

      expect(res.statusCode).toBe(202);
      expect(mailQueue.add).toHaveBeenCalledWith(
        "send-mail",
        expect.objectContaining({
          templateId: "welcome",
          templateContext: { name: "John" },
        }),
      );
    });

    it("should handle attachments correctly", async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { isSuccess: true, user: { id: "user-123" } },
      });

      const res = await request(app)
        .post("/api/mailer/send")
        .set("Authorization", authToken)
        .field("to", "test@example.com")
        .field("subject", "Attachment Test")
        .field("text", "Check attachment")
        .attach("attachments", Buffer.from("test content"), "test.txt");

      expect(res.statusCode).toBe(202);
      const enqueuedData = (mailQueue.add as jest.Mock).mock.calls[0][1];
      expect(enqueuedData.attachments).toHaveLength(1);
      expect(enqueuedData.attachments[0].filename).toBe("test.txt");
    });

    it("should return 400 if validation fails", async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { isSuccess: true, user: { id: "user-123" } },
      });

      const res = await request(app)
        .post("/api/mailer/send")
        .set("Authorization", authToken)
        .field("to", "invalid-email")
        .field("subject", "");

      expect(res.statusCode).toBe(400);
      expect(res.body.isSuccess).toBe(false);
    });

    it("should return 401 if auth delegation fails", async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error("Unauthorized"));

      const res = await request(app)
        .post("/api/mailer/send")
        .set("Authorization", "Bearer invalid")
        .field("to", "test@example.com")
        .field("subject", "Subject")
        .field("text", "Content");

      expect(res.statusCode).toBe(401);
    });
  });

  describe("GET /api/mailer/service-check", () => {
    it("should return service status", async () => {
      const res = await request(app).get("/api/mailer/service-check");
      expect(res.statusCode).toBe(200);
      expect(res.body.isServiceAvailable).toBe(true);
    });
  });
});
