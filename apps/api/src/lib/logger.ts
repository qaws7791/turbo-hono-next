/**
 * Structured logging with Pino
 */

import pino from "pino";

/**
 * Log level configuration based on environment
 */
const getLogLevel = (): pino.LevelWithSilent => {
  const env = process.env.NODE_ENV;
  if (env === "test") return "silent";
  if (env === "production") return "info";
  return "debug";
};

/**
 * Determine if we should use pretty printing
 */
const shouldUsePrettyPrint = (): boolean => {
  return (
    process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "test"
  );
};

/**
 * Pino transport configuration for pretty printing in development
 */
const getTransport = (): pino.TransportSingleOptions | undefined => {
  if (!shouldUsePrettyPrint()) {
    return undefined;
  }

  return {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "HH:MM:ss Z",
      ignore: "pid,hostname",
      singleLine: false,
      messageFormat: "{msg}",
      errorLikeObjectKeys: ["err", "error"],
    },
  };
};

/**
 * Create and configure logger instance
 */
export const logger = pino({
  level: getLogLevel(),
  transport: getTransport(),

  // Base configuration
  base: {
    env: process.env.NODE_ENV,
    service: process.env.SERVICE_NAME || "api",
  },

  // Timestamp configuration
  timestamp: pino.stdTimeFunctions.isoTime,

  // Serializers for common objects
  serializers: {
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
    err: pino.stdSerializers.err,
  },

  // Format error objects properly
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },

  // Redact sensitive fields
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "password",
      "token",
      "accessToken",
      "refreshToken",
      "secret",
    ],
    remove: true,
  },
});

/**
 * Logger utilities for common operations
 */
export const log = {
  /**
   * Log debug information (verbose, only in development)
   */
  debug: (msg: string, data?: Record<string, unknown>) => {
    if (data) {
      logger.debug(data, msg);
    } else {
      logger.debug(msg);
    }
  },

  /**
   * Log informational messages
   */
  info: (msg: string, data?: Record<string, unknown>) => {
    if (data) {
      logger.info(data, msg);
    } else {
      logger.info(msg);
    }
  },

  /**
   * Log warning messages
   */
  warn: (msg: string, data?: Record<string, unknown>) => {
    if (data) {
      logger.warn(data, msg);
    } else {
      logger.warn(msg);
    }
  },

  /**
   * Log error messages
   */
  error: (
    msg: string,
    error?: Error | unknown,
    data?: Record<string, unknown>,
  ) => {
    if (error instanceof Error) {
      logger.error({ ...data, err: error }, msg);
    } else {
      logger.error({ ...data, error }, msg);
    }
  },

  /**
   * Log fatal errors (application crashes)
   */
  fatal: (
    msg: string,
    error?: Error | unknown,
    data?: Record<string, unknown>,
  ) => {
    if (error instanceof Error) {
      logger.fatal({ ...data, err: error }, msg);
    } else {
      logger.fatal({ ...data, error }, msg);
    }
  },

  /**
   * Log HTTP request
   */
  http: (msg: string, data?: Record<string, unknown>) => {
    if (data) {
      logger.info(data, `[HTTP] ${msg}`);
    } else {
      logger.info(`[HTTP] ${msg}`);
    }
  },

  /**
   * Log database operation
   */
  db: (msg: string, data?: Record<string, unknown>) => {
    if (data) {
      logger.debug(data, `[DB] ${msg}`);
    } else {
      logger.debug(`[DB] ${msg}`);
    }
  },

  /**
   * Log AI operation
   */
  ai: (msg: string, data?: Record<string, unknown>) => {
    if (data) {
      logger.info(data, `[AI] ${msg}`);
    } else {
      logger.info(`[AI] ${msg}`);
    }
  },

  /**
   * Log authentication operation
   */
  auth: (msg: string, data?: Record<string, unknown>) => {
    if (data) {
      logger.info(data, `[AUTH] ${msg}`);
    } else {
      logger.info(`[AUTH] ${msg}`);
    }
  },
};

/**
 * Create a child logger with additional context
 */
export function createChildLogger(context: Record<string, unknown>) {
  return logger.child(context);
}

/**
 * Log request start
 */
export function logRequestStart(
  method: string,
  path: string,
  context?: Record<string, unknown>,
) {
  log.http(`${method} ${path}`, {
    method,
    path,
    ...context,
  });
}

/**
 * Log request completion
 */
export function logRequestComplete(
  method: string,
  path: string,
  statusCode: number,
  durationMs: number,
  context?: Record<string, unknown>,
) {
  log.http(`${method} ${path} - ${statusCode} (${durationMs}ms)`, {
    method,
    path,
    statusCode,
    durationMs,
    ...context,
  });
}

/**
 * Log database query
 */
export function logDatabaseQuery(
  operation: string,
  table: string,
  durationMs?: number,
  context?: Record<string, unknown>,
) {
  log.db(`${operation} on ${table}${durationMs ? ` (${durationMs}ms)` : ""}`, {
    operation,
    table,
    durationMs,
    ...context,
  });
}

/**
 * Log AI generation
 */
export function logAIGeneration(
  operation: string,
  durationMs?: number,
  tokensUsed?: number,
  context?: Record<string, unknown>,
) {
  log.ai(`${operation}${durationMs ? ` (${durationMs}ms)` : ""}`, {
    operation,
    durationMs,
    tokensUsed,
    ...context,
  });
}
