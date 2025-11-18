import { isDevelopment } from "@/env";

/**
 * Central logger utility for frontend application
 *
 * Features:
 * - Environment-based log levels (dev: all logs, prod: warn/error only)
 * - Structured logging with metadata
 * - Type-safe logging interface
 * - Production-ready (filters sensitive data)
 * - Extensible for remote logging services (e.g., Sentry)
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogMetadata {
  [key: string]: unknown;
}

interface LogContext {
  timestamp: string;
  level: LogLevel;
  message: string;
  metadata?: LogMetadata;
  stack?: string;
}

class Logger {
  private isDevelopment: boolean;
  private minLevel: LogLevel;
  private levelPriority: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  constructor() {
    this.isDevelopment = isDevelopment;
    // In production, only log warnings and errors
    this.minLevel = this.isDevelopment ? "debug" : "warn";
  }

  /**
   * Check if a log level should be logged
   */
  private shouldLog(level: LogLevel): boolean {
    return this.levelPriority[level] >= this.levelPriority[this.minLevel];
  }

  /**
   * Format log context for output
   */
  private formatContext(context: LogContext): string {
    const { timestamp, level, message } = context;
    return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  }

  /**
   * Sanitize metadata to remove sensitive information in production
   */
  private sanitizeMetadata(metadata?: LogMetadata): LogMetadata | undefined {
    if (!metadata || this.isDevelopment) {
      return metadata;
    }

    // In production, filter out potentially sensitive keys
    const sensitiveKeys = [
      "password",
      "token",
      "secret",
      "apiKey",
      "sessionId",
      "authorization",
    ];

    const sanitized = { ...metadata };
    for (const key of Object.keys(sanitized)) {
      const lowerKey = key.toLowerCase();
      if (sensitiveKeys.some((sensitive) => lowerKey.includes(sensitive))) {
        sanitized[key] = "[REDACTED]";
      }
    }

    return sanitized;
  }

  /**
   * Core logging method
   */
  private log(
    level: LogLevel,
    message: string,
    metadata?: LogMetadata,
    error?: Error,
  ): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const context: LogContext = {
      timestamp: new Date().toISOString(),
      level,
      message,
      metadata: this.sanitizeMetadata(metadata),
      stack: error?.stack,
    };

    const formattedMessage = this.formatContext(context);

    // Console output with appropriate method
    switch (level) {
      case "debug":
        console.debug(formattedMessage, context.metadata);
        break;
      case "info":
        console.info(formattedMessage, context.metadata);
        break;
      case "warn":
        console.warn(formattedMessage, context.metadata);
        break;
      case "error":
        console.error(formattedMessage, context.metadata, context.stack);
        break;
    }

    // Hook for remote logging services (e.g., Sentry)
    this.sendToRemote(context);
  }

  /**
   * Send logs to remote logging service (placeholder)
   * Implement this method when integrating with Sentry, LogRocket, etc.
   */
  private sendToRemote(context: LogContext): void {
    // Only send errors to remote in production
    if (!this.isDevelopment && context.level === "error") {
      // TODO: Integrate with remote logging service
      // Example: Sentry.captureException(context);
    }
  }

  /**
   * Log debug message (development only)
   */
  debug(message: string, metadata?: LogMetadata): void {
    this.log("debug", message, metadata);
  }

  /**
   * Log informational message
   */
  info(message: string, metadata?: LogMetadata): void {
    this.log("info", message, metadata);
  }

  /**
   * Log warning message
   */
  warn(message: string, metadata?: LogMetadata): void {
    this.log("warn", message, metadata);
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error, metadata?: LogMetadata): void {
    this.log("error", message, metadata, error);
  }

  /**
   * Create a scoped logger with a context prefix
   * Useful for module-specific logging
   */
  createScoped(scope: string): ScopedLogger {
    return new ScopedLogger(this, scope);
  }
}

/**
 * Scoped logger for module-specific logging
 */
class ScopedLogger {
  constructor(
    private logger: Logger,
    private scope: string,
  ) {}

  private prefixMessage(message: string): string {
    return `[${this.scope}] ${message}`;
  }

  debug(message: string, metadata?: LogMetadata): void {
    this.logger.debug(this.prefixMessage(message), metadata);
  }

  info(message: string, metadata?: LogMetadata): void {
    this.logger.info(this.prefixMessage(message), metadata);
  }

  warn(message: string, metadata?: LogMetadata): void {
    this.logger.warn(this.prefixMessage(message), metadata);
  }

  error(message: string, error?: Error, metadata?: LogMetadata): void {
    this.logger.error(this.prefixMessage(message), error, metadata);
  }
}

// Export singleton instance
export const logger = new Logger();

// Export types for external use
export type { LogLevel, LogMetadata };
