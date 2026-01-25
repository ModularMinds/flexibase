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
          name: null,
          bio: null,
          avatarUrl: null,
          isActive: true,
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

  describe("PATCH /api/auth/admin/users/:id/status", () => {
    it("should suspend user", async () => {
      const adminToken = generateAccessToken("admin-id", "ADMIN");
      const userId = "user-to-suspend";

      prismaMock.user.update.mockResolvedValue({
        id: userId,
        isActive: false,
      } as User);

      prismaMock.refreshToken.updateMany.mockResolvedValue({ count: 1 });

      const res = await request(app)
        .patch(`/api/auth/admin/users/${userId}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ isActive: false });

      expect(res.statusCode).toEqual(200);
      expect(res.body.isSuccess).toBe(true);
      expect(res.body.message).toContain("suspended");
      expect(prismaMock.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { userId },
        data: { revoked: true },
      });
    });

    it("should activate user", async () => {
      const adminToken = generateAccessToken("admin-id", "ADMIN");
      const userId = "user-to-activate";

      prismaMock.user.update.mockResolvedValue({
        id: userId,
        isActive: true,
      } as User);

      const res = await request(app)
        .patch(`/api/auth/admin/users/${userId}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ isActive: true });

      expect(res.statusCode).toEqual(200);
      expect(res.body.isSuccess).toBe(true);
      expect(res.body.message).toContain("activated");
    });
  });

  describe("DELETE /api/auth/admin/users/:id", () => {
    it("should allow admin to delete another user", async () => {
      const adminToken = generateAccessToken("admin-id", "ADMIN");
      const userId = "user-to-delete";

      prismaMock.user.delete.mockResolvedValue({
        id: userId,
        email: "deleted@example.com",
      } as User);

      const res = await request(app)
        .delete(`/api/auth/admin/users/${userId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.isSuccess).toBe(true);
    });

    it("should fail when admin tries to delete themselves", async () => {
      const adminId = "admin-id";
      const adminToken = generateAccessToken(adminId, "ADMIN");

      const res = await request(app)
        .delete(`/api/auth/admin/users/${adminId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(400);
      expect(res.body.err).toBe("You cannot delete yourself");
    });
  });
});
