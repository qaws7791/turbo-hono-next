import { session, user } from "@repo/database/schema";
import { and, eq, gt, lt } from "drizzle-orm";
import { nanoid } from "nanoid";

import { authConfig } from "../../../config/auth";
import { db } from "../../../database/client";
import { log } from "../../../lib/logger";
import { AuthError, AuthErrors } from "../errors";

/**
 * Session data returned from database queries
 */
export interface SessionData {
  id: string;
  userId: string;
  expiresAt: Date;
  user: {
    id: string;
    email: string;
    name: string;
    emailVerified: Date | null;
    image: string | null;
  };
}

/**
 * Input type for creating a session
 */
export interface CreateSessionInput {
  userId: string;
  userAgent?: string;
  ipAddress?: string;
}

/**
 * Service layer for session management.
 * Handles all session-related database operations.
 */
export class SessionService {
  /**
   * Creates a new session for a user
   * @param input - Session creation data
   * @returns Session token string
   */
  async createSession(input: CreateSessionInput): Promise<string> {
    try {
      const sessionId = nanoid();
      const token = nanoid(32);
      const expiresAt = new Date(
        Date.now() + authConfig.session.expiresIn * 1000,
      );
      const now = new Date();

      await db.insert(session).values({
        id: sessionId,
        token,
        userId: input.userId,
        expiresAt,
        createdAt: now,
        updatedAt: now,
        userAgent: input.userAgent,
        ipAddress: input.ipAddress,
      });

      log.auth("Session created successfully", {
        sessionId,
        userId: input.userId,
      });

      return token;
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }

      log.error("Session creation failed", error, {
        userId: input.userId,
      });

      throw AuthErrors.sessionCreationFailed();
    }
  }

  /**
   * Retrieves a session by its token
   * @param token - Session token
   * @returns Session data with user information or null if not found/expired
   */
  async getSessionByToken(token: string): Promise<SessionData | null> {
    try {
      const result = await db
        .select({
          id: session.id,
          userId: session.userId,
          expiresAt: session.expiresAt,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            emailVerified: user.emailVerified,
            image: user.image,
          },
        })
        .from(session)
        .innerJoin(user, eq(session.userId, user.id))
        .where(and(eq(session.token, token), gt(session.expiresAt, new Date())))
        .limit(1);

      return result[0] || null;
    } catch (error) {
      log.error("Session retrieval failed", error, { token: "***" });

      throw AuthErrors.sessionCreationFailed();
    }
  }

  /**
   * Deletes a session by its token
   * @param token - Session token to delete
   */
  async deleteSession(token: string): Promise<void> {
    try {
      await db.delete(session).where(eq(session.token, token));

      log.auth("Session deleted successfully", { token: "***" });
    } catch (error) {
      log.error("Session deletion failed", error, { token: "***" });

      throw AuthErrors.sessionDeletionFailed();
    }
  }

  /**
   * Deletes all sessions for a specific user
   * @param userId - User ID whose sessions should be deleted
   */
  async deleteAllUserSessions(userId: string): Promise<void> {
    try {
      await db.delete(session).where(eq(session.userId, userId));

      log.auth("All user sessions deleted successfully", { userId });
    } catch (error) {
      log.error("Failed to delete all user sessions", error, { userId });

      throw AuthErrors.sessionDeletionFailed();
    }
  }

  /**
   * Cleans up expired sessions from the database
   * Should be called periodically (e.g., via cron job)
   */
  async cleanupExpiredSessions(): Promise<void> {
    try {
      const result = await db
        .delete(session)
        .where(lt(session.expiresAt, new Date()));

      log.info("Expired sessions cleaned up", {
        deletedCount: result.rowCount || 0,
      });
    } catch (error) {
      log.error("Failed to cleanup expired sessions", error);

      throw AuthErrors.sessionDeletionFailed();
    }
  }

  /**
   * Refreshes a session by creating a new one and deleting the old
   * @param token - Current session token
   * @returns New session token or null if session doesn't exist
   */
  async refreshSession(token: string): Promise<string | null> {
    try {
      const existingSession = await this.getSessionByToken(token);
      if (!existingSession) {
        return null;
      }

      // Delete old session
      await this.deleteSession(token);

      // Create new session
      const newToken = await this.createSession({
        userId: existingSession.userId,
      });

      log.auth("Session refreshed successfully", {
        userId: existingSession.userId,
      });

      return newToken;
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }

      log.error("Session refresh failed", error, { token: "***" });

      throw AuthErrors.sessionCreationFailed();
    }
  }
}

// Export singleton instance
export const sessionService = new SessionService();
