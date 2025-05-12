import { accounts } from "@/db/schema";
import { AccountSelect, type DbClient } from "@/db/types";
import { and, eq } from "drizzle-orm";
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

  async createAccount(
    accountData: typeof accounts.$inferInsert,
  ): Promise<AccountSelect> {
    const [newAccount] = await this.db
      .insert(accounts)
      .values(accountData)
      .returning();
    if (!newAccount) {
      throw new Error("Failed to create account");
    }
    return newAccount;
  }
}
