import { and, eq, lt } from "drizzle-orm";
import { inject, injectable } from "inversify";
import { randomBytes } from "node:crypto";
import { TYPES } from "../../../container/types";
import { Database } from "../../../shared/database/connection";
import { accounts, magicLinks, users } from "../../../shared/database/schema";
import type { MagicLink, User } from "../domain/auth.types";

export interface AuthRepository {
  findUserByEmail(email: string): Promise<User | null>;
  findUserById(id: number): Promise<User | null>;
  createUser(userData: {
    email: string;
    username: string;
    displayName: string;
    profileImage?: string;
  }): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;

  // Magic Link operations
  createMagicLink(data: {
    email: string;
    type: "signup" | "signin";
    expiresAt: Date;
  }): Promise<MagicLink>;
  findMagicLinkByToken(token: string): Promise<MagicLink | null>;
  markMagicLinkAsUsed(id: number): Promise<void>;
  cleanupExpiredMagicLinks(): Promise<void>;

  // Account operations (for Kakao OAuth)
  createAccount(data: {
    userId: number;
    provider: string;
    providerAccountId: string;
  }): Promise<void>;
  findAccountByProvider(
    provider: string,
    providerAccountId: string,
  ): Promise<{ userId: number } | null>;
}

@injectable()
export class AuthRepositoryImpl implements AuthRepository {
  constructor(@inject(TYPES.Database) private readonly db: Database) {}

  async findUserByEmail(email: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return result[0] || null;
  }

  async findUserById(id: number): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return result[0] || null;
  }

  async createUser(userData: {
    email: string;
    username: string;
    displayName: string;
    profileImage?: string;
  }): Promise<User> {
    const result = await this.db
      .insert(users)
      .values({
        email: userData.email,
        username: userData.username,
        displayName: userData.displayName,
        profileImage: userData.profileImage || undefined,
      })
      .returning();

    return result[0];
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const result = await this.db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    return result[0];
  }

  async createMagicLink(data: {
    email: string;
    type: "signup" | "signin";
    expiresAt: Date;
  }): Promise<MagicLink> {
    const token = randomBytes(32).toString("base64url");

    const result = await this.db
      .insert(magicLinks)
      .values({
        email: data.email,
        token,
        type: data.type,
        expiresAt: data.expiresAt,
        isUsed: false,
      })
      .returning();

    return result[0];
  }

  async findMagicLinkByToken(token: string): Promise<MagicLink | null> {
    const result = await this.db
      .select()
      .from(magicLinks)
      .where(eq(magicLinks.token, token))
      .limit(1);

    return result[0] || null;
  }

  async markMagicLinkAsUsed(id: number): Promise<void> {
    await this.db
      .update(magicLinks)
      .set({
        isUsed: true,
        usedAt: new Date(),
      })
      .where(eq(magicLinks.id, id));
  }

  async cleanupExpiredMagicLinks(): Promise<void> {
    await this.db
      .delete(magicLinks)
      .where(
        and(eq(magicLinks.isUsed, false), lt(magicLinks.expiresAt, new Date())),
      );
  }

  async createAccount(data: {
    userId: number;
    provider: string;
    providerAccountId: string;
  }): Promise<void> {
    await this.db.insert(accounts).values({
      userId: data.userId,
      provider: data.provider,
      providerAccountId: data.providerAccountId,
    });
  }

  async findAccountByProvider(
    provider: string,
    providerAccountId: string,
  ): Promise<{ userId: number } | null> {
    const result = await this.db
      .select({ userId: accounts.userId })
      .from(accounts)
      .where(
        and(
          eq(accounts.provider, provider),
          eq(accounts.providerAccountId, providerAccountId),
        ),
      )
      .limit(1);

    return result[0] || null;
  }
}
