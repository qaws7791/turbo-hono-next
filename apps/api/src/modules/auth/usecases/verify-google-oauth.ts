import { tryPromise, unwrap } from "../../../lib/result";
import { ApiError } from "../../../middleware/error-handler";
import {
  computeSessionExpiresAt,
  generateToken,
  sha256Hex,
} from "../auth.utils";

import type { ResultAsync } from "neverthrow";
import type { Config } from "../../../lib/config";
import type { AppError } from "../../../lib/result";
import type { VerifyGoogleOAuthInput as VerifyGoogleOAuthInputType } from "../auth.dto";
import type { AuthRepository } from "../auth.repository";
import type { RequestContext } from "../types";

// ============================================================================
// Helper Functions
// ============================================================================

function computeDefaultDisplayName(email: string): string {
  return email.split("@")[0] || "User";
}

function shouldUpdateDisplayName(
  existingDisplayName: string,
  email: string,
  googleName: string | undefined,
): string | undefined {
  if (!googleName) return undefined;
  const defaultDisplayName = computeDefaultDisplayName(email);
  if (existingDisplayName === defaultDisplayName) return googleName;
  if (existingDisplayName === "User") return googleName;
  return undefined;
}

// ============================================================================
// Sub-handlers
// ============================================================================

/**
 * 기존 OAuth 계정이 있을 때 사용자 정보를 업데이트하고 userId를 반환
 */
async function handleExistingAccount(
  deps: { readonly authRepository: AuthRepository },
  existingAccountUserId: string,
  authAccountId: string,
  scopes: string | null,
  googleDisplayName: string | undefined,
  googleAvatarUrl: string | null,
  googleLocale: string | undefined,
  now: Date,
): Promise<string> {
  const user = await unwrap(
    deps.authRepository.findUserById(existingAccountUserId),
  );
  if (!user) {
    throw new ApiError(
      400,
      "AUTH_ACCOUNT_USER_NOT_FOUND",
      "연결된 사용자를 찾을 수 없습니다.",
    );
  }

  const nextDisplayName = shouldUpdateDisplayName(
    user.displayName,
    user.email,
    googleDisplayName,
  );
  const nextAvatarUrl =
    user.avatarUrl == null && googleAvatarUrl != null
      ? googleAvatarUrl
      : undefined;
  const nextLocale =
    user.locale === "ko-KR" && googleLocale ? googleLocale : undefined;

  await unwrap(
    deps.authRepository.updateAuthAccountScopes({ authAccountId, scopes }),
  );

  await unwrap(deps.authRepository.updateUserLastLogin(user.id, now));

  if (nextDisplayName || nextAvatarUrl || nextLocale) {
    await unwrap(
      deps.authRepository.updateUserProfile({
        userId: user.id,
        displayName: nextDisplayName,
        avatarUrl: nextAvatarUrl,
        locale: nextLocale,
        now,
      }),
    );
  }

  return user.id;
}

/**
 * 이메일로 기존 사용자를 찾아 Google 계정을 연결하거나, 새 사용자를 생성
 */
async function handleNewAccountLink(
  deps: { readonly authRepository: AuthRepository },
  email: string,
  providerAccountId: string,
  scopes: string | null,
  googleDisplayName: string | undefined,
  googleAvatarUrl: string | null,
  googleLocale: string | undefined,
  now: Date,
): Promise<string> {
  const existingUser = await unwrap(deps.authRepository.findUserByEmail(email));

  if (existingUser) {
    // 기존 사용자에 Google 계정 연결
    const nextDisplayName = shouldUpdateDisplayName(
      existingUser.displayName,
      existingUser.email,
      googleDisplayName,
    );
    const nextAvatarUrl =
      existingUser.avatarUrl == null && googleAvatarUrl != null
        ? googleAvatarUrl
        : undefined;
    const nextLocale =
      existingUser.locale === "ko-KR" && googleLocale
        ? googleLocale
        : undefined;

    await unwrap(deps.authRepository.updateUserLastLogin(existingUser.id, now));

    if (nextDisplayName || nextAvatarUrl || nextLocale) {
      await unwrap(
        deps.authRepository.updateUserProfile({
          userId: existingUser.id,
          displayName: nextDisplayName,
          avatarUrl: nextAvatarUrl,
          locale: nextLocale,
          now,
        }),
      );
    }

    await unwrap(
      deps.authRepository.insertAuthAccount({
        userId: existingUser.id,
        provider: "GOOGLE",
        providerAccountId,
        scopes,
        createdAt: now,
      }),
    );

    return existingUser.id;
  }

  // 새 사용자 생성
  const displayName = googleDisplayName ?? computeDefaultDisplayName(email);

  const created = await unwrap(
    deps.authRepository.createUser({
      email,
      displayName,
      avatarUrl: googleAvatarUrl,
      locale: googleLocale,
      now,
    }),
  );

  await unwrap(
    deps.authRepository.insertAuthAccount({
      userId: created.id,
      provider: "GOOGLE",
      providerAccountId,
      scopes,
      createdAt: now,
    }),
  );

  return created.id;
}

/**
 * 사용자 ID 결정 (기존 OAuth 계정 / 이메일로 기존 사용자 연결 / 신규 생성)
 */
async function resolveUserId(
  deps: { readonly authRepository: AuthRepository },
  providerAccountId: string,
  email: string,
  scopes: string | null,
  googleDisplayName: string | undefined,
  googleAvatarUrl: string | null,
  googleLocale: string | undefined,
  now: Date,
): Promise<string> {
  const existingAccount = await unwrap(
    deps.authRepository.findAuthAccountByProviderAccountId({
      provider: "GOOGLE",
      providerAccountId,
    }),
  );

  if (existingAccount) {
    return await handleExistingAccount(
      deps,
      existingAccount.userId,
      existingAccount.id,
      scopes,
      googleDisplayName,
      googleAvatarUrl,
      googleLocale,
      now,
    );
  }

  return await handleNewAccountLink(
    deps,
    email,
    providerAccountId,
    scopes,
    googleDisplayName,
    googleAvatarUrl,
    googleLocale,
    now,
  );
}

// ============================================================================
// Main UseCase
// ============================================================================

export function verifyGoogleOAuth(deps: {
  readonly authRepository: AuthRepository;
  readonly config: Config;
}) {
  return function verifyGoogleOAuth(
    input: VerifyGoogleOAuthInputType,
    ctx: RequestContext,
  ): ResultAsync<{ sessionToken: string; sessionId: string }, AppError> {
    return tryPromise(async () => {
      // 1. Google OAuth 설정 확인
      const clientId = deps.config.GOOGLE_CLIENT_ID;
      const clientSecret = deps.config.GOOGLE_CLIENT_SECRET;
      if (!clientId || !clientSecret) {
        throw new ApiError(
          500,
          "GOOGLE_OAUTH_NOT_CONFIGURED",
          "GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET가 필요합니다.",
        );
      }

      const now = new Date();
      const redirectUri = new URL(
        "/api/auth/google/callback",
        deps.config.BASE_URL,
      ).toString();

      // 2. Google OAuth 코드 교환 (PKCE)
      const token = await unwrap(
        deps.authRepository.exchangeGoogleOAuthCode({
          code: input.code,
          codeVerifier: input.codeVerifier,
          clientId,
          clientSecret,
          redirectUri,
        }),
      );

      // 3. ID 토큰 검증 (필수)
      if (!token.id_token) {
        throw new ApiError(
          502,
          "GOOGLE_ID_TOKEN_MISSING",
          "ID 토큰이 응답에 포함되지 않았습니다.",
        );
      }

      const userInfo = await unwrap(
        deps.authRepository.verifyGoogleIdToken({
          idToken: token.id_token,
          clientId,
        }),
      );

      // 4. 이메일 인증 확인
      if (userInfo.email_verified === false) {
        throw new ApiError(
          400,
          "GOOGLE_EMAIL_NOT_VERIFIED",
          "이메일 인증이 완료되지 않은 계정입니다.",
        );
      }

      const email = userInfo.email;
      const providerAccountId = userInfo.sub;
      const googleDisplayName = userInfo.name?.trim();
      const googleAvatarUrl = userInfo.picture ?? null;
      const googleLocale = userInfo.locale;
      const scopes = token.scope ?? null;

      // 5. 사용자 ID 결정
      const userId = await resolveUserId(
        deps,
        providerAccountId,
        email,
        scopes,
        googleDisplayName,
        googleAvatarUrl,
        googleLocale,
        now,
      );

      // 6. 세션 생성
      const sessionToken = generateToken();
      const sessionTokenHash = sha256Hex(sessionToken);
      const expiresAt = computeSessionExpiresAt(
        now,
        deps.config.SESSION_DURATION_DAYS,
      );

      const session = await unwrap(
        deps.authRepository.insertAuthSession({
          userId,
          sessionTokenHash,
          expiresAt,
          createdIp: ctx.ipAddress,
          userAgent: ctx.userAgent,
          createdAt: now,
        }),
      );

      return { sessionToken, sessionId: session.id };
    });
  };
}
