"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authDelegation = void 0;
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../config/env");
const logger_1 = require("../config/logger");
const authDelegation = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({
                isSuccess: false,
                message: "Authorization token was not provided",
            });
        }
        // Call Auth Service to verify token
        const response = await axios_1.default.get(`${env_1.env.AUTH_SERVICE_URL}/auth/verify-user`, {
            headers: { Authorization: authHeader },
        });
        if (response.data && response.data.isSuccess) {
            // Attach user to request
            req.user = response.data.user;
            next();
        }
        else {
            res.status(401).json({ isSuccess: false, message: "Invalid token" });
        }
    }
    catch (err) {
        logger_1.logger.error("Auth delegation failed: " + err.message);
        const status = err.response?.status || 401;
        res.status(status).json({
            isSuccess: false,
            message: err.response?.data?.message || "Authentication failed",
        });
    }
};
exports.authDelegation = authDelegation;
