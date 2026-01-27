import { NextFunction, Request, Response } from "express";

// Mock the whole middlewares/tokenVerifier.middleware.ts module if possible,
// OR just mock the function if we can using jest.mock mechanism which applies globally?
// Jest 'setupFilesAfterEnv' runs before each test file.
// If I use jest.mock here, it might not work if the test file imports the module before this runs?
// No, setup runs before test code.
// But imports are hoisted.
// Sidenote: modifying the actual module with `jest.mock` in setup file IS the way.

jest.mock("../src/middlewares/tokenVerifier.middleware", () => ({
  tokenVerifier: (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (authHeader === "Bearer mock-admin-token") {
      (req as any).user = {
        id: "admin-id",
        email: "admin@example.com",
        role: "ADMIN",
      };
      return next();
    }
    if (authHeader === "Bearer mock-user-token") {
      (req as any).user = {
        id: "user-id",
        email: "user@example.com",
        role: "USER",
      };
      return next();
    }
    // If we want to simulate failure for tests that expect it
    if (authHeader === "Bearer invalid-token") {
      return res
        .status(401)
        .json({ isSuccess: false, message: "Invalid token" });
    }
    // Default pass, or fail? specific tests might not send header.
    // If no header, real middleware fails.
    if (!authHeader) {
      return res.status(401).json({ isSuccess: false, message: "No token" });
    }

    next();
  },
}));
