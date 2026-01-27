import { NextFunction, Request, Response } from "express";

// Mock Auth Delegation Middleware globaly
jest.mock("../src/middlewares/auth.middleware", () => ({
  authDelegation: (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (authHeader === "Bearer mock-user-token") {
      (req as any).user = {
        id: "user-id",
        email: "user@example.com",
        role: "USER",
      };
      return next();
    }
    if (authHeader === "Bearer mock-admin-token") {
      (req as any).user = {
        id: "admin-id",
        email: "admin@example.com",
        role: "ADMIN",
      };
      return next();
    }
    // Fail otherwise
    // But for tests that don't send header, we might want to let the real logic (mocked here) fail?
    // If unit test specifically checks 401:
    res
      .status(401)
      .json({
        isSuccess: false,
        message: "Authorization token was not provided",
      });
  },
}));
