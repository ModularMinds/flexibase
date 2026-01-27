import { createClient } from "redis";
import { logger } from "./logger";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

export const redisClient = createClient({
  url: redisUrl,
});

redisClient.on("error", (err) => {
  logger.error("Redis Client Error", err);
});

redisClient.on("connect", () => {
  logger.info("Connected to Redis");
});

export const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    logger.error("Failed to connect to Redis:", err);
  }
};
