import { eq, lt } from "drizzle-orm";
import { inject, injectable } from "inversify";
import { randomBytes } from "node:crypto";
import { TYPES } from "../../../container/types";
import { Database } from "../../../shared/database/connection";
import { sessions } from "../../../shared/database/schema";
import type { Session } from "../domain/auth.types";

export interface SessionRepository {
  createSession(userId: number, expiresAt: Date): Promise<Session>;
  findSessionByToken(token: string): Promise<Session | null>;
  invalidateSession(token: string): Promise<void>;
  invalidateAllUserSessions(userId: number): Promise<void>;
  cleanupExpiredSessions(): Promise<void>;
  extendSession(token: string, newExpiresAt: Date): Promise<Session>;
}

@injectable()
export class SessionRepositoryImpl implements SessionRepository {
  constructor(@inject(TYPES.Database) private readonly db: Database) {}

  async createSession(userId: number, expiresAt: Date): Promise<Session> {
    const token = randomBytes(32).toString("base64url");

    const result = await this.db
      .insert(sessions)
      .values({
        userId,
        token,
        expiresAt,
      })
      .returning();

    return result[0];
  }

  async findSessionByToken(token: string): Promise<Session | null> {
    const result = await this.db
      .select()
      .from(sessions)
      .where(eq(sessions.token, token))
      .limit(1);

    return result[0] || null;
  }

  async invalidateSession(token: string): Promise<void> {
    await this.db.delete(sessions).where(eq(sessions.token, token));
  }

  async invalidateAllUserSessions(userId: number): Promise<void> {
    await this.db.delete(sessions).where(eq(sessions.userId, userId));
  }

  async cleanupExpiredSessions(): Promise<void> {
    await this.db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
  }

  async extendSession(token: string, newExpiresAt: Date): Promise<Session> {
    const result = await this.db
      .update(sessions)
      .set({
        expiresAt: newExpiresAt,
      })
      .where(eq(sessions.token, token))
      .returning();

    return result[0];
  }
}
