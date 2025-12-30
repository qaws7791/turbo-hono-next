import { err, ok } from "neverthrow";

import { CONFIG } from "../../../lib/config";
import { ApiError } from "../../../middleware/error-handler";
import { VerifyMagicLinkInput } from "../auth.dto";
import {
  consumeMagicLinkToken,
  createUser,
  findMagicLinkTokenByHash,
  findUserByEmail,
  insertAuthSession,
  updateUserLastLogin,
} from "../auth.repository";
import {
  computeSessionExpiresAt,
  generateToken,
  sha256Hex,
  validateRedirectPath,
} from "../auth.utils";

import type { Result } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type { VerifyMagicLinkInput as VerifyMagicLinkInputType } from "../auth.dto";
import type { RequestContext } from "../types";

async function upsertUserByEmail(
  email: string,
  now: Date,
): Promise<
  Result<
    {
      readonly id: string;
      readonly email: string;
      readonly displayName: string;
    },
    AppError
  >
> {
  const existingResult = await findUserByEmail(email);
  if (existingResult.isErr()) return err(existingResult.error);
  const existing = existingResult.value;

  if (existing) {
    const updateResult = await updateUserLastLogin(existing.id, now);
    if (updateResult.isErr()) return err(updateResult.error);

    return ok({
      id: existing.id,
      email: existing.email,
      displayName: existing.displayName,
    });
  }

  const displayName = email.split("@")[0] || "User";
  const createResult = await createUser({ email, displayName, now });
  if (createResult.isErr()) return err(createResult.error);
  const created = createResult.value;

  return ok({
    id: created.id,
    email: created.email,
    displayName: created.displayName,
  });
}

export async function verifyMagicLink(
  input: VerifyMagicLinkInputType,
  ctx: RequestContext,
): Promise<
  Result<
    {
      redirectPath: string;
      sessionToken: string;
      sessionId: string;
    },
    AppError
  >
> {
  // 1. 입력 검증
  const parseResult = VerifyMagicLinkInput.safeParse(input);
  if (!parseResult.success) {
    return err(
      new ApiError(400, "VALIDATION_ERROR", parseResult.error.message),
    );
  }
  const validated = parseResult.data;

  const tokenHash = sha256Hex(validated.token);
  const now = new Date();

  // 2. 토큰 조회
  const recordResult = await findMagicLinkTokenByHash(tokenHash);
  if (recordResult.isErr()) return err(recordResult.error);
  const record = recordResult.value;

  // 3. 토큰 유효성 검증
  if (!record) {
    return err(
      new ApiError(400, "MAGIC_LINK_INVALID", "유효하지 않은 토큰입니다."),
    );
  }
  if (record.consumedAt) {
    return err(new ApiError(400, "MAGIC_LINK_USED", "이미 사용된 토큰입니다."));
  }
  if (record.expiresAt.getTime() < now.getTime()) {
    return err(
      new ApiError(400, "MAGIC_LINK_EXPIRED", "토큰이 만료되었습니다."),
    );
  }
  if (!validateRedirectPath(record.redirectPath)) {
    return err(
      new ApiError(
        400,
        "INVALID_REDIRECT",
        "redirectPath가 허용되지 않습니다.",
      ),
    );
  }

  // 4. 토큰 소비 처리
  const consumeResult = await consumeMagicLinkToken(record.id, now);
  if (consumeResult.isErr()) return err(consumeResult.error);

  // 5. 사용자 조회/생성
  const userResult = await upsertUserByEmail(record.email, now);
  if (userResult.isErr()) return err(userResult.error);
  const user = userResult.value;

  // 6. 세션 생성
  const sessionToken = generateToken();
  const sessionTokenHash = sha256Hex(sessionToken);
  const expiresAt = computeSessionExpiresAt(now, CONFIG.SESSION_DURATION_DAYS);

  const sessionResult = await insertAuthSession({
    userId: user.id,
    sessionTokenHash,
    expiresAt,
    createdIp: ctx.ipAddress,
    userAgent: ctx.userAgent,
    createdAt: now,
  });
  if (sessionResult.isErr()) return err(sessionResult.error);
  const session = sessionResult.value;

  return ok({
    redirectPath: record.redirectPath,
    sessionToken,
    sessionId: session.id,
  });
}
