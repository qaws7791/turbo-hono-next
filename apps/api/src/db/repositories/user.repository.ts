import { users } from "@/db/schema";
import { type DbClient, UserSelect } from "@/db/types";
import { eq } from "drizzle-orm";
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
      throw new Error("Failed to create user");
    }
    return newUser;
  }
}
