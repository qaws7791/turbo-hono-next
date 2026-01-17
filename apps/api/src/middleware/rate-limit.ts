import { createMiddleware } from "hono/factory";

import { ApiError } from "./error-handler";

import type { Context } from "hono";

type RateLimitBucket = {
  count: number;
  resetAtMs: number;
};

export type RateLimitOptions = {
  readonly windowMs: number;
  readonly max: number;
  readonly keyGenerator: (c: Context) => string;
};

export function getClientIp(c: Context): string | null {
  const value =
    c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for");

  if (!value) return null;

  const first = value.split(",")[0]?.trim();
  return first && first.length > 0 ? first : null;
}

export function createOptionalRateLimitMiddleware(
  enabled: boolean,
  options: RateLimitOptions,
) {
  if (!enabled) {
    return createMiddleware(async (_c, next) => {
      await next();
    });
  }

  return createRateLimitMiddleware(options);
}

export function createRateLimitMiddleware(options: RateLimitOptions) {
  const buckets = new Map<string, RateLimitBucket>();

  return createMiddleware(async (c, next) => {
    const key = options.keyGenerator(c);
    const now = Date.now();

    const bucket = buckets.get(key);
    const resetAtMs = bucket?.resetAtMs ?? now + options.windowMs;
    const isExpired = resetAtMs <= now;

    const effectiveBucket: RateLimitBucket = isExpired
      ? { count: 0, resetAtMs: now + options.windowMs }
      : { count: bucket?.count ?? 0, resetAtMs };

    const remaining = options.max - effectiveBucket.count;
    c.header("X-RateLimit-Limit", String(options.max));
    c.header("X-RateLimit-Remaining", String(Math.max(0, remaining - 1)));
    c.header(
      "X-RateLimit-Reset",
      String(Math.floor(effectiveBucket.resetAtMs / 1000)),
    );

    if (effectiveBucket.count >= options.max) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((effectiveBucket.resetAtMs - now) / 1000),
      );
      c.header("Retry-After", String(retryAfterSeconds));
      throw new ApiError(
        429,
        "RATE_LIMIT_EXCEEDED",
        "요청 한도를 초과했습니다.",
        {
          retryAfter: retryAfterSeconds,
        },
      );
    }

    effectiveBucket.count += 1;
    buckets.set(key, effectiveBucket);

    await next();
  });
}
