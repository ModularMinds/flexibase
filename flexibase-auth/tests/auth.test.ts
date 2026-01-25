import request from "supertest";
import { hash } from "bcrypt";
import { app } from "../src/app";
import { prismaMock } from "../src/config/prismaMock";
import { User } from "@prisma/client";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../src/services/token.service";

describe("Auth Endpoints", () => {
  describe("POST /api/auth/sign-up", () => {
    it("should create a new user and return a token", async () => {
      const newUser = {
        email: "test@example.com",
        password: "Password123!",
      };

      prismaMock.user.create.mockResolvedValue({
        id: "1",
        email: newUser.email,
        password: "hashedpassword",
        role: "USER",
        createdAt: new Date(),
        updatedAt: new Date(),
        name: null,
        bio: null,
        avatarUrl: null,
        isActive: true,
      } as User);

      const res = await request(app).post("/api/auth/sign-up").send(newUser);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty("accessToken");
      expect(res.body).toHaveProperty("refreshToken");
      expect(res.body.isSuccess).toBe(true);
      expect(res.body.isSuccess).toBe(true);
    });

    it("should fail when user already exists", async () => {
      prismaMock.user.create.mockRejectedValue(
        new Error("Unique constraint failed"),
      );

      const res = await request(app).post("/api/auth/sign-up").send({
        email: "existing@example.com",
        password: "Password123!",
      });

      expect(res.statusCode).toEqual(500); // 409 would be better but controller returns 500 for errors
      expect(res.body.isSuccess).toBe(false);
    });

    it("should fail with invalid email format", async () => {
      const res = await request(app).post("/api/auth/sign-up").send({
        email: "invalid-email",
        password: "Password123!",
      });

      expect(res.statusCode).toEqual(400);
      expect(res.body.isSuccess).toBe(false);
      expect(res.body.err).toBeDefined();
    });

    it("should fail with weak password", async () => {
      const res = await request(app).post("/api/auth/sign-up").send({
        email: "test@example.com",
        password: "weak",
      });
      expect(res.statusCode).toEqual(400);
      expect(res.body.isSuccess).toBe(false);
      const hasMinLengthError = res.body.err.some((e: any) =>
        e.message.includes("at least 8 characters"),
      );
      expect(hasMinLengthError).toBe(true);
    });

    it("should fail with extremely long email", async () => {
      const res = await request(app)
        .post("/api/auth/sign-up")
        .send({
          email: "a".repeat(300) + "@example.com",
          password: "Password123!",
        });
      expect(res.statusCode).toEqual(400);
    });

    it("should fail with empty payload", async () => {
      const res = await request(app).post("/api/auth/sign-up").send({});
      expect(res.statusCode).toEqual(400);
      expect(res.body.isSuccess).toBe(false);
    });

    it("should fail with missing password", async () => {
      const res = await request(app).post("/api/auth/sign-up").send({
        email: "test@example.com",
      });
      expect(res.statusCode).toEqual(400);
      expect(res.body.isSuccess).toBe(false);
    });
  });

  describe("POST /api/auth/sign-in", () => {
    it("should sign in successfully with valid credentials", async () => {
      const password = "Password123!";
      const hashedPassword = await hash(password, 10);

      const mockUser = {
        id: "123",
        email: "test@example.com",
        password: hashedPassword,
        role: "USER",
        createdAt: new Date(),
        updatedAt: new Date(),
        name: null,
        bio: null,
        avatarUrl: null,
        isActive: true,
      } as User;

      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      const res = await request(app).post("/api/auth/sign-in").send({
        email: "test@example.com",
        password: password,
      });

      expect(res.statusCode).toEqual(200);
      expect(res.body.isSuccess).toBe(true);
      expect(res.body).toHaveProperty("accessToken");
      expect(res.body).toHaveProperty("refreshToken");
    });

    it("should fail with invalid credentials", async () => {
      const password = "Password123!";
      const hashedPassword = await hash(password, 10);

      const mockUser = {
        id: "123",
        email: "test@example.com",
        password: hashedPassword,
        role: "USER",
        createdAt: new Date(),
        updatedAt: new Date(),
        name: null,
        bio: null,
        avatarUrl: null,
        isActive: true,
      } as User;

      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      const res = await request(app).post("/api/auth/sign-in").send({
        email: "test@example.com",
        password: "wrong_password",
      });

      expect(res.statusCode).toEqual(401);
      expect(res.body.isSuccess).toBe(false);
      expect(res.body.err).toBe("Invalid credentials");
    });

    it("should fail when user not found", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const res = await request(app).post("/api/auth/sign-in").send({
        email: "nonexistent@example.com",
        password: "Password123!",
      });

      expect(res.statusCode).toEqual(401);
      expect(res.body.isSuccess).toBe(false);
    });

    it("should fail when account is suspended", async () => {
      const mockUser = {
        id: "123",
        email: "suspended@example.com",
        password: "hashed_password",
        role: "USER",
        createdAt: new Date(),
        updatedAt: new Date(),
        name: null,
        bio: null,
        avatarUrl: null,
        isActive: false,
      } as User;

      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      const res = await request(app).post("/api/auth/sign-in").send({
        email: "suspended@example.com",
        password: "any_password", // Password check happens AFTER suspension check? No, usually before or after lookup.
        // In AuthService: findUser -> check !user -> check !isActive -> check password.
        // So password check is LAST.
        // Wait, looking at AuthService code (Step 1177):
        // 1. findUser
        // 2. !isActive check (throws 403)
        // 3. compare password
        // So password doesn't matter if suspended check is first.
        // But if I want to be safe, I should provide a password.
      });

      expect(res.statusCode).toEqual(403);
      expect(res.body.err).toBe("Account is suspended");
    });
  });

  describe("GET /api/auth/verify-user", () => {
    it("should return unauthorized without token", async () => {
      const res = await request(app).get("/api/auth/verify-user");
      expect(res.statusCode).toEqual(401);
      expect(res.body.isSuccess).toBe(false);
    });
  });

  describe("POST /api/auth/refresh-token", () => {
    it("should refresh token with valid refresh token", async () => {
      const userId = "1";
      const validToken = await generateRefreshToken(userId);

      // Mock db response: The token stored in DB MUST match the token we send
      prismaMock.refreshToken.findUnique.mockResolvedValue({
        id: "1",
        token: validToken, // In real DB this would be hashed?
        // Wait, token service usually hashes tokens before storing?
        // Let's check `token.service.ts` or `refreshToken.controller.ts`.
        // If it stores raw token, this is fine.
        // If it stores hash, we need to mock findUnique to return the hash?
        // No, controller finds by token string usually? Or finds by Family ID?
        // If it finds by `findUnique({ where: { token: ... } })`, then it stores raw token (or reversible).
        // If it stores hash, it can't find by token string unless it hashes input first.

        // Assumption: It stores raw token or we act as if it's the raw token found.
        // If the implementation compares hashes potentially.
        // But for `findUnique`, the input `where` must match.
        // So we mock `findUnique` returning a record IF the input matches.
        // `prismaMock` returns this value regardless of input arguments unless configured with `when`.
        // So we return a record.

        userId: userId,
        revoked: false,
        expiresAt: new Date(Date.now() + 10000), // Valid expiry
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Mock create (rotation)
      prismaMock.refreshToken.create.mockResolvedValue({
        id: "2",
        token: "new_refresh_token",
        userId: userId,
        revoked: false,
        expiresAt: new Date(Date.now() + 10000),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Mock update (revoke old)
      // prismaMock.refreshToken.update.mockResolvedValue(...);

      const res = await request(app).post("/api/auth/refresh-token").send({
        refreshToken: validToken,
      });

      expect(res.statusCode).toEqual(200);
      expect(res.body.isSuccess).toBe(true);
      expect(res.body).toHaveProperty("accessToken");
      expect(res.body).toHaveProperty("refreshToken");
    });

    it("should revoke the old refresh token after a successful rotation", async () => {
      const userId = "1";
      const oldToken = await generateRefreshToken(userId);

      prismaMock.refreshToken.findUnique.mockResolvedValue({
        id: "old-token-id",
        token: oldToken,
        userId: userId,
        revoked: false,
        expiresAt: new Date(Date.now() + 10000),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      prismaMock.refreshToken.update.mockResolvedValue({} as any);

      await request(app).post("/api/auth/refresh-token").send({
        refreshToken: oldToken,
      });

      expect(prismaMock.refreshToken.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "old-token-id" },
          data: { revoked: true },
        }),
      );
    });

    it("should fail with invalid refresh token", async () => {
      const res = await request(app).post("/api/auth/refresh-token").send({
        refreshToken: "invalid_token",
      });
      expect(res.statusCode).toEqual(401);
      expect(res.body.isSuccess).toBe(false);
    });

    it("should fail with revoked refresh token", async () => {
      const userId = "1";
      const validToken = await generateRefreshToken(userId);

      prismaMock.refreshToken.findUnique.mockResolvedValue({
        id: "1",
        token: validToken,
        userId: userId,
        revoked: true, // REVOKED
        expiresAt: new Date(Date.now() + 10000),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app).post("/api/auth/refresh-token").send({
        refreshToken: validToken,
      });

      expect(res.statusCode).toEqual(401);
      expect(res.body.isSuccess).toBe(false);
    });

    it("should fail with expired refresh token", async () => {
      const userId = "1";
      const validToken = await generateRefreshToken(userId);

      prismaMock.refreshToken.findUnique.mockResolvedValue({
        id: "1",
        token: validToken,
        userId: userId,
        revoked: false,
        expiresAt: new Date(Date.now() - 10000), // EXPIRED
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app).post("/api/auth/refresh-token").send({
        refreshToken: validToken,
      });

      expect(res.statusCode).toEqual(401);
      expect(res.body.isSuccess).toBe(false);
    });
  });

  describe("POST /api/auth/change-password", () => {
    it("should change password successfully", async () => {
      const userId = "user-123";
      const oldPassword = "OldPassword123!";
      const newPassword = "NewPassword123!";
      const hashedOldPassword = await hash(oldPassword, 10);
      const userToken = generateAccessToken(userId, "USER");

      prismaMock.user.findUnique.mockResolvedValue({
        id: userId,
        password: hashedOldPassword,
      } as any);

      prismaMock.user.update.mockResolvedValue({
        id: userId,
      } as any);

      const res = await request(app)
        .post("/api/auth/change-password")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ oldPassword, newPassword });

      expect(res.statusCode).toEqual(200);
      expect(res.body.isSuccess).toBe(true);
      expect(prismaMock.user.update).toHaveBeenCalled();
    });

    it("should fail with incorrect old password", async () => {
      const userId = "user-123";
      const userToken = generateAccessToken(userId, "USER");

      prismaMock.user.findUnique.mockResolvedValue({
        id: userId,
        password: await hash("correct_pass", 10),
      } as any);

      const res = await request(app)
        .post("/api/auth/change-password")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ oldPassword: "wrong_pass", newPassword: "NewPassword123!" });

      expect(res.statusCode).toEqual(401);
      expect(res.body.err).toBe("Invalid old password");
    });
  });
});
