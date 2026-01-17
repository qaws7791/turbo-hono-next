import { tryPromise, unwrap } from "../../../lib/result";
import { computeSessionExpiresAt, sha256Hex } from "../auth.utils";

import type { ResultAsync } from "neverthrow";
import type { Config } from "../../../lib/config";
import type { AppError } from "../../../lib/result";
import type { AuthRepository } from "../auth.repository";
import type { AuthContext, RequestContext } from "../types";

export function getSessionByToken(deps: {
  readonly authRepository: AuthRepository;
  readonly config: Config;
}) {
  return function getSessionByToken(
    token: string,
    ctx: RequestContext,
  ): ResultAsync<AuthContext | null, AppError> {
    return tryPromise(async () => {
      const tokenHash = sha256Hex(token);
      const now = new Date();

      // 1. 활성 세션 조회
      const session = await unwrap(
        deps.authRepository.findActiveSessionByTokenHash(tokenHash, now),
      );

      if (!session) {
        return null;
      }

      // 2. 사용자 조회
      const user = await unwrap(
        deps.authRepository.findUserById(session.userId),
      );

      if (!user) {
        return null;
      }

      // 3. 세션 만료 시간 갱신
      const newExpiresAt = computeSessionExpiresAt(
        now,
        deps.config.SESSION_DURATION_DAYS,
      );

      await unwrap(
        deps.authRepository.updateSessionExpiryAndMetadata({
          sessionId: session.id,
          expiresAt: newExpiresAt,
          createdIp: ctx.ipAddress ?? session.createdIp,
          userAgent: ctx.userAgent ?? session.userAgent,
        }),
      );

      return {
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl ?? null,
          locale: user.locale,
          timezone: user.timezone,
          subscriptionPlan: user.subscriptionPlan,
        },
        session: {
          id: session.id,
          expiresAt: newExpiresAt,
        },
      };
    });
  };
}
