"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const logger_1 = require("../config/logger");
const errorHandler = (err, req, res, next) => {
    logger_1.logger.error(err.stack || err.message);
    const status = err.status || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({
        isSuccess: false,
        message,
    });
};
exports.errorHandler = errorHandler;
