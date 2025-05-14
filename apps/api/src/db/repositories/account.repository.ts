import { accounts } from "@/db/schema";
import { AccountSelect, type DbClient } from "@/db/types";
import { DatabaseError } from "@/errors/database-error";
import { and, eq } from "drizzle-orm";
import status from "http-status";
import { inject, injectable } from "inversify";

@injectable()
export class AccountRepository {
  constructor(
    @inject("db")
    private db: DbClient,
  ) {}

  async findAccountByProviderAndId(
    providerId: string,
    providerAccountId: string,
  ): Promise<AccountSelect | undefined> {
    return this.db.query.accounts.findFirst({
      where: and(
        eq(accounts.providerId, providerId),
        eq(accounts.providerAccountId, providerAccountId),
      ),
    });
  }

  async findAccountByUserId(
    userId: number,
  ): Promise<AccountSelect | undefined> {
    return this.db.query.accounts.findFirst({
      where: eq(accounts.userId, userId),
    });
  }

  async createAccount(
    accountData: typeof accounts.$inferInsert,
  ): Promise<AccountSelect> {
    const [newAccount] = await this.db
      .insert(accounts)
      .values(accountData)
      .returning();
    if (!newAccount) {
      throw new DatabaseError(
        "Failed to create account",
        status.INTERNAL_SERVER_ERROR,
      );
    }
    return newAccount;
  }

  async updateAccountPassword(
    userId: number,
    passwordHash: string,
  ): Promise<void> {
    await this.db
      .update(accounts)
      .set({
        password: passwordHash,
        updatedAt: new Date(),
      })
      .where(eq(accounts.userId, userId));
  }

  async deleteAccount(userId: number): Promise<void> {
    await this.db.delete(accounts).where(eq(accounts.userId, userId));
  }
}
