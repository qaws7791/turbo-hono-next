import { err, ok } from "neverthrow";

import { CONFIG } from "../../../lib/config";
import { ApiError } from "../../../middleware/error-handler";
import { VerifyGoogleOAuthInput } from "../auth.dto";
import {
  createUser,
  exchangeGoogleOAuthCode,
  fetchGoogleUserInfo,
  findAuthAccountByProviderAccountId,
  findUserByEmail,
  findUserById,
  insertAuthAccount,
  insertAuthSession,
  updateAuthAccountScopes,
  updateUserLastLogin,
  updateUserProfile,
} from "../auth.repository";
import {
  computeSessionExpiresAt,
  generateToken,
  sha256Hex,
} from "../auth.utils";

import type { Result } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type { VerifyGoogleOAuthInput as VerifyGoogleOAuthInputType } from "../auth.dto";
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
  existingAccountUserId: string,
  authAccountId: string,
  scopes: string | null,
  googleDisplayName: string | undefined,
  googleAvatarUrl: string | null,
  googleLocale: string | undefined,
  now: Date,
): Promise<Result<string, AppError>> {
  const userResult = await findUserById(existingAccountUserId);
  if (userResult.isErr()) return err(userResult.error);

  const user = userResult.value;
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
    googleDisplayName,
  );
  const nextAvatarUrl =
    user.avatarUrl == null && googleAvatarUrl != null
      ? googleAvatarUrl
      : undefined;
  const nextLocale =
    user.locale === "ko-KR" && googleLocale ? googleLocale : undefined;

  const scopesResult = await updateAuthAccountScopes({ authAccountId, scopes });
  if (scopesResult.isErr()) return err(scopesResult.error);

  const lastLoginResult = await updateUserLastLogin(user.id, now);
  if (lastLoginResult.isErr()) return err(lastLoginResult.error);

  if (nextDisplayName || nextAvatarUrl || nextLocale) {
    const profileResult = await updateUserProfile({
      userId: user.id,
      displayName: nextDisplayName,
      avatarUrl: nextAvatarUrl,
      locale: nextLocale,
      now,
    });
    if (profileResult.isErr()) return err(profileResult.error);
  }

  return ok(user.id);
}

/**
 * 이메일로 기존 사용자를 찾아 Google 계정을 연결하거나, 새 사용자를 생성
 */
async function handleNewAccountLink(
  email: string,
  providerAccountId: string,
  scopes: string | null,
  googleDisplayName: string | undefined,
  googleAvatarUrl: string | null,
  googleLocale: string | undefined,
  now: Date,
): Promise<Result<string, AppError>> {
  const existingUserResult = await findUserByEmail(email);
  if (existingUserResult.isErr()) return err(existingUserResult.error);

  const existingUser = existingUserResult.value;

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

    const lastLoginResult = await updateUserLastLogin(existingUser.id, now);
    if (lastLoginResult.isErr()) return err(lastLoginResult.error);

    if (nextDisplayName || nextAvatarUrl || nextLocale) {
      const profileResult = await updateUserProfile({
        userId: existingUser.id,
        displayName: nextDisplayName,
        avatarUrl: nextAvatarUrl,
        locale: nextLocale,
        now,
      });
      if (profileResult.isErr()) return err(profileResult.error);
    }

    const authAccountResult = await insertAuthAccount({
      userId: existingUser.id,
      provider: "GOOGLE",
      providerAccountId,
      scopes,
      createdAt: now,
    });
    if (authAccountResult.isErr()) return err(authAccountResult.error);

    return ok(existingUser.id);
  }

  // 새 사용자 생성
  const displayName = googleDisplayName ?? computeDefaultDisplayName(email);

  const createUserResult = await createUser({
    email,
    displayName,
    avatarUrl: googleAvatarUrl,
    locale: googleLocale,
    now,
  });
  if (createUserResult.isErr()) return err(createUserResult.error);

  const created = createUserResult.value;

  const authAccountResult = await insertAuthAccount({
    userId: created.id,
    provider: "GOOGLE",
    providerAccountId,
    scopes,
    createdAt: now,
  });
  if (authAccountResult.isErr()) return err(authAccountResult.error);

  return ok(created.id);
}

/**
 * 사용자 ID 결정 (기존 OAuth 계정 / 이메일로 기존 사용자 연결 / 신규 생성)
 */
async function resolveUserId(
  providerAccountId: string,
  email: string,
  scopes: string | null,
  googleDisplayName: string | undefined,
  googleAvatarUrl: string | null,
  googleLocale: string | undefined,
  now: Date,
): Promise<Result<string, AppError>> {
  const existingAccountResult = await findAuthAccountByProviderAccountId({
    provider: "GOOGLE",
    providerAccountId,
  });
  if (existingAccountResult.isErr()) return err(existingAccountResult.error);

  const existingAccount = existingAccountResult.value;

  if (existingAccount) {
    return handleExistingAccount(
      existingAccount.userId,
      existingAccount.id,
      scopes,
      googleDisplayName,
      googleAvatarUrl,
      googleLocale,
      now,
    );
  }

  return handleNewAccountLink(
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

export async function verifyGoogleOAuth(
  input: VerifyGoogleOAuthInputType,
  ctx: RequestContext,
): Promise<Result<{ sessionToken: string; sessionId: string }, AppError>> {
  // 1. 입력 검증
  const parseResult = VerifyGoogleOAuthInput.safeParse(input);
  if (!parseResult.success) {
    return err(
      new ApiError(400, "VALIDATION_ERROR", parseResult.error.message),
    );
  }
  const validated = parseResult.data;

  // 2. Google OAuth 설정 확인
  const clientId = CONFIG.GOOGLE_CLIENT_ID;
  const clientSecret = CONFIG.GOOGLE_CLIENT_SECRET;
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
  const redirectUri = new URL(
    "/api/auth/google/callback",
    CONFIG.BASE_URL,
  ).toString();

  // 3. Google OAuth 코드 교환
  const tokenResult = await exchangeGoogleOAuthCode({
    code: validated.code,
    clientId,
    clientSecret,
    redirectUri,
  });
  if (tokenResult.isErr()) return err(tokenResult.error);
  const token = tokenResult.value;

  // 4. Google 사용자 정보 조회
  const userInfoResult = await fetchGoogleUserInfo(token.access_token);
  if (userInfoResult.isErr()) return err(userInfoResult.error);
  const userInfo = userInfoResult.value;

  // 5. 이메일 인증 확인
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

  // 6. 사용자 ID 결정
  const userIdResult = await resolveUserId(
    providerAccountId,
    email,
    scopes,
    googleDisplayName,
    googleAvatarUrl,
    googleLocale,
    now,
  );
  if (userIdResult.isErr()) return err(userIdResult.error);
  const userId = userIdResult.value;

  // 7. 세션 생성
  const sessionToken = generateToken();
  const sessionTokenHash = sha256Hex(sessionToken);
  const expiresAt = computeSessionExpiresAt(now, CONFIG.SESSION_DURATION_DAYS);

  const sessionResult = await insertAuthSession({
    userId,
    sessionTokenHash,
    expiresAt,
    createdIp: ctx.ipAddress,
    userAgent: ctx.userAgent,
    createdAt: now,
  });
  if (sessionResult.isErr()) return err(sessionResult.error);
  const session = sessionResult.value;

  return ok({ sessionToken, sessionId: session.id });
}
