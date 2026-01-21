import { err, ok, safeTry } from "neverthrow";

import { ApiError } from "../../../middleware/error-handler";
import {
  computeSessionExpiresAt,
  generateToken,
  sha256Hex,
} from "../auth.utils";

import type { Config } from "../../../lib/config";
import type { AppError } from "../../../lib/result";
import type { VerifyGoogleOAuthInput as VerifyGoogleOAuthInputType } from "../auth.dto";
import type { AuthRepository } from "../auth.repository";
import type { RequestContext } from "../types";
import type { Result, ResultAsync } from "neverthrow";

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

function buildGoogleRedirectUri(baseUrl: string): Result<string, ApiError> {
  try {
    return ok(new URL("/api/auth/google/callback", baseUrl).toString());
  } catch {
    return err(
      new ApiError(
        500,
        "INVALID_BASE_URL",
        "BASE_URL 설정이 올바르지 않습니다.",
        {
          baseUrl,
        },
      ),
    );
  }
}

// ============================================================================
// Sub-handlers
// ============================================================================

function handleExistingAccount(params: {
  readonly authRepository: AuthRepository;
  readonly existingAccountUserId: string;
  readonly authAccountId: string;
  readonly scopes: string | null;
  readonly googleDisplayName: string | undefined;
  readonly googleAvatarUrl: string | null;
  readonly googleLocale: string | undefined;
  readonly now: Date;
}): ResultAsync<string, AppError> {
  return safeTry(async function* () {
    const user = yield* params.authRepository.findUserById(
      params.existingAccountUserId,
    );
    if (!user) {
      return err(
        new ApiError(
          400,
          "AUTH_ACCOUNT_USER_NOT_FOUND",
          "연결된 사용자를 찾을 수 없습니다.",
        ),
      );
    }

    const nextDisplayName = shouldUpdateDisplayName(
      user.displayName,
      user.email,
      params.googleDisplayName,
    );
    const nextAvatarUrl =
      user.avatarUrl == null && params.googleAvatarUrl != null
        ? params.googleAvatarUrl
        : undefined;
    const nextLocale =
      user.locale === "ko-KR" && params.googleLocale
        ? params.googleLocale
        : undefined;

    yield* params.authRepository.updateAuthAccountScopes({
      authAccountId: params.authAccountId,
      scopes: params.scopes,
    });

    yield* params.authRepository.updateUserLastLogin(user.id, params.now);

    if (nextDisplayName || nextAvatarUrl || nextLocale) {
      yield* params.authRepository.updateUserProfile({
        userId: user.id,
        displayName: nextDisplayName,
        avatarUrl: nextAvatarUrl,
        locale: nextLocale,
        now: params.now,
      });
    }

    return ok(user.id);
  });
}

function handleNewAccountLink(params: {
  readonly authRepository: AuthRepository;
  readonly email: string;
  readonly providerAccountId: string;
  readonly scopes: string | null;
  readonly googleDisplayName: string | undefined;
  readonly googleAvatarUrl: string | null;
  readonly googleLocale: string | undefined;
  readonly now: Date;
}): ResultAsync<string, AppError> {
  return safeTry(async function* () {
    const existingUser = yield* params.authRepository.findUserByEmail(
      params.email,
    );

    if (existingUser) {
      const nextDisplayName = shouldUpdateDisplayName(
        existingUser.displayName,
        existingUser.email,
        params.googleDisplayName,
      );
      const nextAvatarUrl =
        existingUser.avatarUrl == null && params.googleAvatarUrl != null
          ? params.googleAvatarUrl
          : undefined;
      const nextLocale =
        existingUser.locale === "ko-KR" && params.googleLocale
          ? params.googleLocale
          : undefined;

      yield* params.authRepository.updateUserLastLogin(
        existingUser.id,
        params.now,
      );

      if (nextDisplayName || nextAvatarUrl || nextLocale) {
        yield* params.authRepository.updateUserProfile({
          userId: existingUser.id,
          displayName: nextDisplayName,
          avatarUrl: nextAvatarUrl,
          locale: nextLocale,
          now: params.now,
        });
      }

      yield* params.authRepository.insertAuthAccount({
        userId: existingUser.id,
        provider: "GOOGLE",
        providerAccountId: params.providerAccountId,
        scopes: params.scopes,
        createdAt: params.now,
      });

      return ok(existingUser.id);
    }

    const displayName =
      params.googleDisplayName ?? computeDefaultDisplayName(params.email);

    const created = yield* params.authRepository.createUser({
      email: params.email,
      displayName,
      avatarUrl: params.googleAvatarUrl,
      locale: params.googleLocale,
      now: params.now,
    });

    yield* params.authRepository.insertAuthAccount({
      userId: created.id,
      provider: "GOOGLE",
      providerAccountId: params.providerAccountId,
      scopes: params.scopes,
      createdAt: params.now,
    });

    return ok(created.id);
  });
}

function resolveUserId(params: {
  readonly authRepository: AuthRepository;
  readonly providerAccountId: string;
  readonly email: string;
  readonly scopes: string | null;
  readonly googleDisplayName: string | undefined;
  readonly googleAvatarUrl: string | null;
  readonly googleLocale: string | undefined;
  readonly now: Date;
}): ResultAsync<string, AppError> {
  return safeTry(async function* () {
    const existingAccount =
      yield* params.authRepository.findAuthAccountByProviderAccountId({
        provider: "GOOGLE",
        providerAccountId: params.providerAccountId,
      });

    if (existingAccount) {
      const userId = yield* handleExistingAccount({
        authRepository: params.authRepository,
        existingAccountUserId: existingAccount.userId,
        authAccountId: existingAccount.id,
        scopes: params.scopes,
        googleDisplayName: params.googleDisplayName,
        googleAvatarUrl: params.googleAvatarUrl,
        googleLocale: params.googleLocale,
        now: params.now,
      });
      return ok(userId);
    }

    const userId = yield* handleNewAccountLink({
      authRepository: params.authRepository,
      email: params.email,
      providerAccountId: params.providerAccountId,
      scopes: params.scopes,
      googleDisplayName: params.googleDisplayName,
      googleAvatarUrl: params.googleAvatarUrl,
      googleLocale: params.googleLocale,
      now: params.now,
    });
    return ok(userId);
  });
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
    return safeTry(async function* () {
      const clientId = deps.config.GOOGLE_CLIENT_ID;
      const clientSecret = deps.config.GOOGLE_CLIENT_SECRET;
      if (!clientId || !clientSecret) {
        return err(
          new ApiError(
            500,
            "GOOGLE_OAUTH_NOT_CONFIGURED",
            "GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET가 필요합니다.",
          ),
        );
      }

      const now = new Date();
      const redirectUri = yield* buildGoogleRedirectUri(deps.config.BASE_URL);

      const token = yield* deps.authRepository.exchangeGoogleOAuthCode({
        code: input.code,
        codeVerifier: input.codeVerifier,
        clientId,
        clientSecret,
        redirectUri,
      });

      if (!token.id_token) {
        return err(
          new ApiError(
            502,
            "GOOGLE_ID_TOKEN_MISSING",
            "ID 토큰이 응답에 포함되지 않았습니다.",
          ),
        );
      }

      const userInfo = yield* deps.authRepository.verifyGoogleIdToken({
        idToken: token.id_token,
        clientId,
      });

      if (userInfo.email_verified === false) {
        return err(
          new ApiError(
            400,
            "GOOGLE_EMAIL_NOT_VERIFIED",
            "이메일 인증이 완료되지 않은 계정입니다.",
          ),
        );
      }

      const email = userInfo.email;
      const providerAccountId = userInfo.sub;
      const googleDisplayName = userInfo.name?.trim();
      const googleAvatarUrl = userInfo.picture ?? null;
      const googleLocale = userInfo.locale;
      const scopes = token.scope ?? null;

      const userId = yield* resolveUserId({
        authRepository: deps.authRepository,
        providerAccountId,
        email,
        scopes,
        googleDisplayName,
        googleAvatarUrl,
        googleLocale,
        now,
      });

      const sessionToken = generateToken();
      const sessionTokenHash = sha256Hex(sessionToken);
      const expiresAt = computeSessionExpiresAt(
        now,
        deps.config.SESSION_DURATION_DAYS,
      );

      const session = yield* deps.authRepository.insertAuthSession({
        userId,
        sessionTokenHash,
        expiresAt,
        createdIp: ctx.ipAddress,
        userAgent: ctx.userAgent,
        createdAt: now,
      });

      return ok({ sessionToken, sessionId: session.id });
    });
  };
}
