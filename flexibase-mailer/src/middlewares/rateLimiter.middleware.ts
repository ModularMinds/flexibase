import rateLimit from "express-rate-limit";
import { logger } from "../config/logger";

/**
 * Standard rate limiter for mailer operations.
 * Limits to 50 requests per hour per IP.
 */
export const mailerRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50,
  message: {
    isSuccess: false,
    message:
      "Too many email requests from this IP, please try again after an hour",
  },
  handler: (req, res, next, options) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(options.statusCode).send(options.message);
  },
  standardHeaders: true,
  legacyHeaders: false,
});
