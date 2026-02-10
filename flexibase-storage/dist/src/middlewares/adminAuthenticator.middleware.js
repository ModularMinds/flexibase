"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminAuthenticator = void 0;
const adminAuthenticator = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const [username, password] = Buffer.from(authHeader?.split(" ")[1], "base64")
            .toString("ascii")
            .split(":");
        if (username !== process.env.FLEXIBASE_ADMIN_USER ||
            password !== process.env.FLEXIBASE_ADMIN_PASSWORD) {
            next(JSON.stringify({ isSuccess: false, message: "invalid admin creds" }));
        }
        next();
    }
    catch (err) {
        next(res.json({ isSuccess: false, err }));
    }
};
exports.adminAuthenticator = adminAuthenticator;
