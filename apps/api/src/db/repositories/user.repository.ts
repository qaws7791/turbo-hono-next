import { users } from "@/db/schema";
import { type DbClient, UserSelect } from "@/db/types";
import { DatabaseError } from "@/errors/database-error";
import { eq } from "drizzle-orm";
import status from "http-status";
import { inject, injectable } from "inversify";

@injectable()
export class UserRepository {
  constructor(
    @inject("db")
    private db: DbClient,
  ) {}

  async findUserById(id: number): Promise<UserSelect | undefined> {
    return this.db.query.users.findFirst({ where: eq(users.id, id) });
  }

  async findUserByEmail(email: string): Promise<UserSelect | undefined> {
    return this.db.query.users.findFirst({ where: eq(users.email, email) });
  }

  async createUser(userData: typeof users.$inferInsert): Promise<UserSelect> {
    const [newUser] = await this.db.insert(users).values(userData).returning();
    if (!newUser) {
      throw new DatabaseError(
        "Failed to create user",
        status.INTERNAL_SERVER_ERROR,
      );
    }
    return newUser;
  }

  async updateEmailVerified(userId: number, verified: boolean): Promise<void> {
    await this.db
      .update(users)
      .set({
        emailVerified: verified ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async updateUserEmail(userId: number, email: string): Promise<void> {
    await this.db
      .update(users)
      .set({
        email,
        emailVerified: null, // 이메일이 변경되면 인증 상태 초기화
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }
}
