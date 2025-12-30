import { err, ok } from "neverthrow";

import { CONFIG } from "../../../lib/config";
import {
  findActiveSessionByTokenHash,
  findUserById,
  updateSessionExpiryAndMetadata,
} from "../auth.repository";
import { computeSessionExpiresAt, sha256Hex } from "../auth.utils";

import type { Result } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type { AuthContext, RequestContext } from "../types";

export async function getSessionByToken(
  token: string,
  ctx: RequestContext,
): Promise<Result<AuthContext | null, AppError>> {
  const tokenHash = sha256Hex(token);
  const now = new Date();

  // 1. 활성 세션 조회
  const sessionResult = await findActiveSessionByTokenHash(tokenHash, now);
  if (sessionResult.isErr()) return err(sessionResult.error);
  const session = sessionResult.value;

  if (!session) {
    return ok(null);
  }

  // 2. 사용자 조회
  const userResult = await findUserById(session.userId);
  if (userResult.isErr()) return err(userResult.error);
  const user = userResult.value;

  if (!user) {
    return ok(null);
  }

  // 3. 세션 만료 시간 갱신
  const newExpiresAt = computeSessionExpiresAt(
    now,
    CONFIG.SESSION_DURATION_DAYS,
  );

  const updateResult = await updateSessionExpiryAndMetadata({
    sessionId: session.id,
    expiresAt: newExpiresAt,
    createdIp: ctx.ipAddress ?? session.createdIp,
    userAgent: ctx.userAgent ?? session.userAgent,
  });
  if (updateResult.isErr()) return err(updateResult.error);

  return ok({
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl ?? null,
      locale: user.locale,
      timezone: user.timezone,
    },
    session: {
      id: session.id,
      expiresAt: newExpiresAt,
    },
  });
}
