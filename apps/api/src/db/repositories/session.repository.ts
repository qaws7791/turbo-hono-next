import { sessions } from "@/db/schema";
import { type DbClient, SessionSelect } from "@/db/types";
import { and, eq, gte, lte } from "drizzle-orm";
import { inject, injectable } from "inversify";

@injectable()
export class SessionRepository {
  constructor(
    @inject("db")
    private db: DbClient,
  ) {}

  async findSessionByToken(token: string): Promise<SessionSelect | undefined> {
    return this.db.query.sessions.findFirst({
      where: and(
        eq(sessions.token, token),
        gte(sessions.expiresAt, new Date()),
      ),
    });
  }

  async createSession(
    sessionData: typeof sessions.$inferInsert,
  ): Promise<SessionSelect> {
    const [newSession] = await this.db
      .insert(sessions)
      .values(sessionData)
      .returning();
    if (!newSession) {
      throw new Error("Failed to create session");
    }
    return newSession;
  }

  async updateSessionExpiresAt(id: number, expiresAt: Date): Promise<void> {
    await this.db
      .update(sessions)
      .set({ expiresAt, updatedAt: new Date() })
      .where(eq(sessions.id, id));
  }

  async deleteSessionByToken(token: string): Promise<void> {
    await this.db.delete(sessions).where(eq(sessions.token, token));
  }

  async deleteExpiredSessions(): Promise<void> {
    await this.db.delete(sessions).where(lte(sessions.expiresAt, new Date()));
  }
}
