import { ok, safeTry } from "neverthrow";

import { computeSessionExpiresAt, sha256Hex } from "../domain/auth.utils";

import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../../../common/result";
import type { AuthConfig } from "../../api/config";
import type { AuthContext, RequestContext } from "../../api/types";
import type { AuthRepository } from "../infrastructure/auth.repository";

export function getSessionByToken(deps: {
  readonly authRepository: AuthRepository;
  readonly config: AuthConfig;
}) {
  return function getSessionByToken(
    token: string,
    ctx: RequestContext,
  ): ResultAsync<AuthContext | null, AppError> {
    return safeTry(async function* () {
      const tokenHash = sha256Hex(token);
      const now = new Date();

      // 1. 활성 세션 조회
      const session = yield* deps.authRepository.findActiveSessionByTokenHash(
        tokenHash,
        now,
      );

      if (!session) {
        return ok(null);
      }

      // 2. 사용자 조회
      const user = yield* deps.authRepository.findUserById(session.userId);

      if (!user) {
        return ok(null);
      }

      // 3. 세션 만료 시간 갱신
      const newExpiresAt = computeSessionExpiresAt(
        now,
        deps.config.SESSION_DURATION_DAYS,
      );

      yield* deps.authRepository.updateSessionExpiryAndMetadata({
        sessionId: session.id,
        expiresAt: newExpiresAt,
        createdIp: ctx.ipAddress ?? session.createdIp,
        userAgent: ctx.userAgent ?? session.userAgent,
      });

      return ok({
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
      });
    });
  };
}
