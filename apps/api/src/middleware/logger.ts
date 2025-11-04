/**
 * Logger middleware for Hono
 * Automatically logs all HTTP requests and responses
 */

import { log, logRequestComplete, logRequestStart } from "../lib/logger";

import type { Context, Next } from "hono";

/**
 * Logger middleware for Hono
 * Logs request details, response status, and duration
 */
export async function loggerMiddleware(c: Context, next: Next) {
  const start = Date.now();
  const { method } = c.req;
  const path = c.req.path;

  // Log request start
  logRequestStart(method, path, {
    userAgent: c.req.header("user-agent"),
  });

  try {
    // Process request
    await next();

    // Calculate duration
    const durationMs = Date.now() - start;
    const statusCode = c.res.status;

    // Log request completion
    logRequestComplete(method, path, statusCode, durationMs, {
      userAgent: c.req.header("user-agent"),
    });
  } catch (error) {
    // Calculate duration even on error
    const durationMs = Date.now() - start;

    // Log error
    log.error(`Request failed: ${method} ${path}`, error, {
      method,
      path,
      durationMs,
      userAgent: c.req.header("user-agent"),
    });

    // Re-throw to let error handler deal with it
    throw error;
  }
}
