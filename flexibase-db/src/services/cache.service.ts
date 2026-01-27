import { redisClient } from "../config/redis";
import { logger } from "../config/logger";
import { SetOptions } from "redis";

const DEFAULT_TTL = 3600; // 1 hour

export const cacheService = {
  get: async <T>(key: string): Promise<T | null> => {
    try {
      const data = await redisClient.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (err) {
      logger.warn(`Cache GET error for key ${key}:`, err);
      return null;
    }
  },

  set: async (
    key: string,
    value: any,
    ttl: number = DEFAULT_TTL,
  ): Promise<void> => {
    try {
      await redisClient.set(key, JSON.stringify(value), {
        EX: ttl,
      } as SetOptions);
    } catch (err) {
      logger.warn(`Cache SET error for key ${key}:`, err);
    }
  },

  del: async (key: string): Promise<void> => {
    try {
      await redisClient.del(key);
    } catch (err) {
      logger.warn(`Cache DEL error for key ${key}:`, err);
    }
  },

  // Helper to invalidate all keys matching a pattern (e.g. "tables:*")
  // Note: SCAN is better for production than KEYS, but for simplicity/low volume checking keys is okay-ish.
  // Actually, let's implement a targeted invalidation strategy instead of pattern scanning if possible.
  // Or use SCAN.
  invalidatePattern: async (pattern: string): Promise<void> => {
    try {
      let cursor = 0;
      do {
        const reply = await redisClient.scan(cursor.toString(), {
          MATCH: pattern,
          COUNT: 100,
        });
        cursor = Number(reply.cursor);
        const keys = reply.keys;
        if (keys.length > 0) {
          await redisClient.del(keys);
        }
      } while (cursor !== 0);
    } catch (err) {
      logger.warn(`Cache Invalidate Pattern error for ${pattern}:`, err);
    }
  },
};
