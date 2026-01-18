import {
  authAccounts,
  authSessions,
  magicLinkTokens,
  users,
} from "@repo/database/schema";
import { and, eq, gt, isNull } from "drizzle-orm";
import { z } from "zod";

import { tryPromise } from "../../lib/result";
import { ApiError } from "../../middleware/error-handler";

import type { Database } from "@repo/database";
import type { ResultAsync } from "neverthrow";
import type { Logger } from "pino";
import type { Config } from "../../lib/config";
import type { AppError } from "../../lib/result";

export type AuthRepositoryDeps = {
  readonly db: Database;
  readonly config: Config;
  readonly logger: Logger;
};

export function createAuthRepository(deps: AuthRepositoryDeps) {
  const db = deps.db;
  const config = deps.config;
  const logger = deps.logger;

  return {
    findUserByEmail(
      email: string,
    ): ResultAsync<typeof users.$inferSelect | null, AppError> {
      return tryPromise(async () => {
        const rows = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);
        return rows[0] ?? null;
      });
    },

    findUserById(
      userId: string,
    ): ResultAsync<typeof users.$inferSelect | null, AppError> {
      return tryPromise(async () => {
        const rows = await db
          .select()
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);
        return rows[0] ?? null;
      });
    },

    updateUserLastLogin(
      userId: string,
      now: Date,
    ): ResultAsync<void, AppError> {
      return tryPromise(async () => {
        await db
          .update(users)
          .set({ lastLoginAt: now, updatedAt: now })
          .where(eq(users.id, userId));
      });
    },

    createUser(input: {
      readonly email: string;
      readonly displayName: string;
      readonly avatarUrl?: string | null;
      readonly locale?: string;
      readonly timezone?: string;
      readonly now: Date;
    }): ResultAsync<typeof users.$inferSelect, AppError> {
      return tryPromise(async () => {
        const created = await db
          .insert(users)
          .values({
            email: input.email,
            displayName: input.displayName,
            avatarUrl: input.avatarUrl ?? null,
            locale: input.locale ?? "ko-KR",
            timezone: input.timezone ?? "Asia/Seoul",
            lastLoginAt: input.now,
            updatedAt: input.now,
            createdAt: input.now,
          })
          .returning();

        const user = created[0];
        if (!user) {
          return Promise.reject(
            new ApiError(
              500,
              "USER_CREATE_FAILED",
              "사용자 생성에 실패했습니다.",
            ),
          );
        }

        return user;
      });
    },

    updateUserProfile(input: {
      readonly userId: string;
      readonly displayName?: string;
      readonly avatarUrl?: string | null;
      readonly locale?: string;
      readonly timezone?: string;
      readonly now: Date;
    }): ResultAsync<void, AppError> {
      return tryPromise(async () => {
        const next: Partial<typeof users.$inferInsert> = {
          updatedAt: input.now,
        };
        if (input.displayName !== undefined)
          next.displayName = input.displayName;
        if (input.avatarUrl !== undefined) next.avatarUrl = input.avatarUrl;
        if (input.locale !== undefined) next.locale = input.locale;
        if (input.timezone !== undefined) next.timezone = input.timezone;

        await db.update(users).set(next).where(eq(users.id, input.userId));
      });
    },

    insertAuthSession(input: {
      readonly userId: string;
      readonly sessionTokenHash: string;
      readonly expiresAt: Date;
      readonly createdIp?: string;
      readonly userAgent?: string;
      readonly createdAt: Date;
    }): ResultAsync<typeof authSessions.$inferSelect, AppError> {
      return tryPromise(async () => {
        const inserted = await db
          .insert(authSessions)
          .values({
            userId: input.userId,
            sessionTokenHash: input.sessionTokenHash,
            expiresAt: input.expiresAt,
            createdIp: input.createdIp,
            userAgent: input.userAgent,
            createdAt: input.createdAt,
          })
          .returning();

        const session = inserted[0];
        if (!session) {
          return Promise.reject(
            new ApiError(
              500,
              "SESSION_CREATE_FAILED",
              "세션 생성에 실패했습니다.",
            ),
          );
        }

        return session;
      });
    },

    findActiveSessionByTokenHash(
      tokenHash: string,
      now: Date,
    ): ResultAsync<typeof authSessions.$inferSelect | null, AppError> {
      return tryPromise(async () => {
        const sessions = await db
          .select()
          .from(authSessions)
          .where(
            and(
              eq(authSessions.sessionTokenHash, tokenHash),
              isNull(authSessions.revokedAt),
              gt(authSessions.expiresAt, now),
            ),
          )
          .limit(1);

        return sessions[0] ?? null;
      });
    },

    updateSessionExpiryAndMetadata(input: {
      readonly sessionId: string;
      readonly expiresAt: Date;
      readonly createdIp: string | null;
      readonly userAgent: string | null;
    }): ResultAsync<void, AppError> {
      return tryPromise(async () => {
        await db
          .update(authSessions)
          .set({
            expiresAt: input.expiresAt,
            createdIp: input.createdIp,
            userAgent: input.userAgent,
          })
          .where(eq(authSessions.id, input.sessionId));
      });
    },

    revokeSession(
      sessionId: string,
      revokedAt: Date,
    ): ResultAsync<void, AppError> {
      return tryPromise(async () => {
        await db
          .update(authSessions)
          .set({ revokedAt })
          .where(eq(authSessions.id, sessionId));
      });
    },

    findAuthAccountByProviderAccountId(input: {
      readonly provider: typeof authAccounts.$inferSelect.provider;
      readonly providerAccountId: string;
    }): ResultAsync<typeof authAccounts.$inferSelect | null, AppError> {
      return tryPromise(async () => {
        const rows = await db
          .select()
          .from(authAccounts)
          .where(
            and(
              eq(authAccounts.provider, input.provider),
              eq(authAccounts.providerAccountId, input.providerAccountId),
            ),
          )
          .limit(1);

        return rows[0] ?? null;
      });
    },

    insertAuthAccount(input: {
      readonly userId: string;
      readonly provider: typeof authAccounts.$inferSelect.provider;
      readonly providerAccountId: string;
      readonly scopes: string | null;
      readonly createdAt: Date;
    }): ResultAsync<typeof authAccounts.$inferSelect, AppError> {
      return tryPromise(async () => {
        const inserted = await db
          .insert(authAccounts)
          .values({
            userId: input.userId,
            provider: input.provider,
            providerAccountId: input.providerAccountId,
            scopes: input.scopes,
            createdAt: input.createdAt,
          })
          .returning();

        const account = inserted[0];
        if (!account) {
          return Promise.reject(
            new ApiError(
              500,
              "AUTH_ACCOUNT_CREATE_FAILED",
              "OAuth 계정 생성에 실패했습니다.",
            ),
          );
        }

        return account;
      });
    },

    updateAuthAccountScopes(input: {
      readonly authAccountId: string;
      readonly scopes: string | null;
    }): ResultAsync<void, AppError> {
      return tryPromise(async () => {
        await db
          .update(authAccounts)
          .set({ scopes: input.scopes })
          .where(eq(authAccounts.id, input.authAccountId));
      });
    },

    insertMagicLinkToken(input: {
      readonly email: string;
      readonly tokenHash: string;
      readonly expiresAt: Date;
      readonly redirectPath: string;
      readonly createdIp?: string;
      readonly userAgent?: string;
      readonly createdAt: Date;
    }): ResultAsync<void, AppError> {
      return tryPromise(async () => {
        await db.insert(magicLinkTokens).values({
          email: input.email,
          tokenHash: input.tokenHash,
          expiresAt: input.expiresAt,
          redirectPath: input.redirectPath,
          createdIp: input.createdIp,
          userAgent: input.userAgent,
          createdAt: input.createdAt,
        });
      });
    },

    findMagicLinkTokenByHash(
      tokenHash: string,
    ): ResultAsync<typeof magicLinkTokens.$inferSelect | null, AppError> {
      return tryPromise(async () => {
        const rows = await db
          .select()
          .from(magicLinkTokens)
          .where(eq(magicLinkTokens.tokenHash, tokenHash))
          .limit(1);

        return rows[0] ?? null;
      });
    },

    consumeMagicLinkToken(
      id: string,
      consumedAt: Date,
    ): ResultAsync<void, AppError> {
      return tryPromise(async () => {
        await db
          .update(magicLinkTokens)
          .set({ consumedAt })
          .where(eq(magicLinkTokens.id, id));
      });
    },

    sendLoginLinkEmail(input: {
      readonly email: string;
      readonly verifyUrl: string;
    }): ResultAsync<void, AppError> {
      return tryPromise(async () => {
        if (config.EMAIL_DELIVERY_MODE === "resend") {
          if (!config.RESEND_API_KEY || !config.RESEND_EMAIL) {
            logger.warn(
              { email: input.email },
              "magic_link.email_disabled_missing_resend_config",
            );
            return;
          }

          const { Resend } = await import("resend");
          const resend = new Resend(config.RESEND_API_KEY);
          await resend.emails.send({
            from: config.RESEND_EMAIL,
            to: input.email,
            subject: "로그인 링크",
            html: `<p>아래 링크로 로그인하세요:</p><p><a href="${input.verifyUrl}">${input.verifyUrl}</a></p>`,
          });
          return;
        }

        if (config.NODE_ENV === "development" || config.NODE_ENV === "test") {
          logger.info(
            { email: input.email, verifyUrl: input.verifyUrl },
            "magic_link.dev",
          );
          return;
        }

        logger.warn({ email: input.email }, "magic_link.email_disabled");
      });
    },

    exchangeGoogleOAuthCode(input: {
      readonly code: string;
      readonly codeVerifier: string;
      readonly clientId: string;
      readonly clientSecret: string;
      readonly redirectUri: string;
    }): ResultAsync<GoogleTokenResponse, AppError> {
      return tryPromise(async () => {
        const { Google, OAuth2RequestError, ArcticFetchError } = await import(
          "arctic"
        );
        const google = new Google(
          input.clientId,
          input.clientSecret,
          input.redirectUri,
        );

        try {
          const tokens = await google.validateAuthorizationCode(
            input.code,
            input.codeVerifier,
          );

          return {
            access_token: tokens.accessToken(),
            token_type: "Bearer",
            expires_in: tokens.accessTokenExpiresAt()
              ? Math.floor(
                  (tokens.accessTokenExpiresAt()!.getTime() - Date.now()) /
                    1000,
                )
              : undefined,
            refresh_token: tokens.hasRefreshToken()
              ? tokens.refreshToken()
              : undefined,
            scope: undefined,
            id_token: (() => {
              try {
                return tokens.idToken();
              } catch {
                return undefined;
              }
            })(),
          };
        } catch (e) {
          if (e instanceof OAuth2RequestError) {
            throw new ApiError(
              502,
              "GOOGLE_TOKEN_EXCHANGE_FAILED",
              `토큰 교환 실패: ${e.code}`,
              { code: e.code, description: e.description },
            );
          }
          if (e instanceof ArcticFetchError) {
            throw new ApiError(
              502,
              "GOOGLE_TOKEN_EXCHANGE_FAILED",
              "Google OAuth 서버 연결 실패",
              { cause: String(e.cause) },
            );
          }
          throw e;
        }
      });
    },

    fetchGoogleUserInfo(
      accessToken: string,
    ): ResultAsync<GoogleUserInfo, AppError> {
      return tryPromise(async () => {
        const res = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: { authorization: `Bearer ${accessToken}` },
          },
        );

        const json = (await res.json().catch(() => null)) as unknown;
        if (!res.ok) {
          return Promise.reject(
            new ApiError(
              502,
              "GOOGLE_USERINFO_FAILED",
              "사용자 정보 조회 실패",
              {
                status: res.status,
                body: json,
              },
            ),
          );
        }

        const parsed = googleUserInfoSchema.safeParse(json);
        if (!parsed.success) {
          return Promise.reject(
            new ApiError(
              502,
              "GOOGLE_USERINFO_INVALID",
              "사용자 정보 응답 형식이 올바르지 않습니다.",
              {
                issues: parsed.error.issues,
              },
            ),
          );
        }

        return parsed.data;
      });
    },
  };
}

export type AuthRepository = ReturnType<typeof createAuthRepository>;

// Arctic 사용으로 Zod 스키마 런타임 검증은 더 이상 필요 없음
// 타입 정의만 유지
export type GoogleTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  id_token?: string;
};

const googleUserInfoSchema = z.object({
  sub: z.string().min(1),
  email: z.string().email(),
  email_verified: z.boolean().optional(),
  name: z.string().min(1).optional(),
  picture: z.string().url().optional(),
  locale: z.string().min(1).optional(),
});

export type GoogleUserInfo = z.infer<typeof googleUserInfoSchema>;
