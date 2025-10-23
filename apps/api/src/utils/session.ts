import { and, eq, gt } from "drizzle-orm";
import { nanoid } from "nanoid";
import { session, user } from "@repo/database/schema";

import { authConfig } from "../config/auth";
import { db } from "../database/client";

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

export const sessionUtils = {
  async createSession(
    userId: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<string> {
    const sessionId = nanoid();
    const token = nanoid(32);
    const expiresAt = new Date(
      Date.now() + authConfig.session.expiresIn * 1000,
    );
    const now = new Date();

    await db.insert(session).values({
      id: sessionId,
      token,
      userId,
      expiresAt,
      createdAt: now,
      updatedAt: now,
      userAgent,
      ipAddress,
    });

    return token;
  },

  async getSessionByToken(token: string): Promise<SessionData | null> {
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
  },

  async deleteSession(token: string): Promise<void> {
    await db.delete(session).where(eq(session.token, token));
  },

  async deleteAllUserSessions(userId: string): Promise<void> {
    await db.delete(session).where(eq(session.userId, userId));
  },

  async cleanupExpiredSessions(): Promise<void> {
    await db.delete(session).where(gt(session.expiresAt, new Date()));
  },

  async refreshSession(token: string): Promise<string | null> {
    const existingSession = await this.getSessionByToken(token);
    if (!existingSession) {
      return null;
    }

    // Delete old session
    await this.deleteSession(token);

    // Create new session
    return await this.createSession(existingSession.userId);
  },
};
