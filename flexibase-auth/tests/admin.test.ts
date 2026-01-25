import request from "supertest";
import { app } from "../src/app";
import { prismaMock } from "../src/config/prismaMock";
import { generateAccessToken } from "../src/services/token.service";
import { User } from "@prisma/client";

describe("Admin Endpoints", () => {
  describe("GET /api/auth/admin/get-users", () => {
    it("should allow access for ADMIN role", async () => {
      const adminToken = generateAccessToken("admin-id", "ADMIN");

      prismaMock.user.findMany.mockResolvedValue([
        {
          id: "1",
          email: "user@example.com",
          password: "hash",
          role: "USER",
          createdAt: new Date(),
          updatedAt: new Date(),
        } as User,
      ]);

      const res = await request(app)
        .get("/api/auth/admin/get-users")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.isSuccess).toBe(true);
      expect(res.body.users).toHaveLength(1);
    });

    it("should deny access for USER role", async () => {
      const userToken = generateAccessToken("user-id", "USER");

      const res = await request(app)
        .get("/api/auth/admin/get-users")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(403);
      expect(res.body.isSuccess).toBe(false);
    });

    it("should deny access without token", async () => {
      const res = await request(app).get("/api/auth/admin/get-users");
      expect(res.statusCode).toEqual(401);
    });
  });
});
