"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Mock Auth Delegation Middleware globaly
jest.mock("../src/middlewares/auth.middleware", () => ({
    authDelegation: (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (authHeader === "Bearer mock-user-token") {
            req.user = {
                id: "user-id",
                email: "user@example.com",
                role: "USER",
            };
            return next();
        }
        if (authHeader === "Bearer mock-admin-token") {
            req.user = {
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
