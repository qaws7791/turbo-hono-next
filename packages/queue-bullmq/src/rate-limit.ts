import { createMiddleware } from "hono/factory";

import type IORedis from "ioredis";
import type { Context } from "hono";

export type RateLimitOptions = {
  readonly windowMs: number;
  readonly max: number;
  readonly keyGenerator: (c: Context) => string;
};

export type RedisRateLimitDeps = {
  readonly redis: IORedis;
};

export function createRedisRateLimitMiddleware(
  deps: RedisRateLimitDeps,
  options: RateLimitOptions,
) {
  return createMiddleware(async (c, next) => {
    const key = `rate_limit:${options.keyGenerator(c)}`;
    const now = Date.now();
    const windowStart = now - options.windowMs;

    const multi = deps.redis.multi();
    multi.zremrangebyscore(key, 0, windowStart);
    multi.zcard(key);
    multi.zadd(key, now, `${now}-${Math.random()}`);
    multi.pexpire(key, options.windowMs);

    const results = await multi.exec();
    const currentCount = (results?.[1]?.[1] as number) ?? 0;

    const remaining = Math.max(0, options.max - currentCount - 1);
    const resetAt = now + options.windowMs;

    c.header("X-RateLimit-Limit", String(options.max));
    c.header("X-RateLimit-Remaining", String(remaining));
    c.header("X-RateLimit-Reset", String(Math.floor(resetAt / 1000)));

    if (currentCount >= options.max) {
      const retryAfterSeconds = Math.ceil(options.windowMs / 1000);
      c.header("Retry-After", String(retryAfterSeconds));
      return c.json(
        {
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: "요청 한도를 초과했습니다.",
            details: { retryAfter: retryAfterSeconds },
          },
        },
        429,
      );
    }

    await next();
  });
}

export function createOptionalRedisRateLimitMiddleware(
  enabled: boolean,
  deps: RedisRateLimitDeps,
  options: RateLimitOptions,
) {
  if (!enabled) {
    return createMiddleware(async (_c, next) => {
      await next();
    });
  }

  return createRedisRateLimitMiddleware(deps, options);
}
