import { err, ok, safeTry } from "neverthrow";

import { coreError } from "../../../../common/core-error";
import {
  computeSessionExpiresAt,
  generateToken,
  sha256Hex,
  validateRedirectPath,
} from "../domain/auth.utils";

import type { AppError } from "../../../../common/result";
import type { AuthConfig } from "../../api/config";
import type { VerifyMagicLinkInput as VerifyMagicLinkInputType } from "../../api/schema";
import type { RequestContext } from "../../api/types";
import type { AuthRepository } from "../infrastructure/auth.repository";
import type { ResultAsync } from "neverthrow";

function upsertUserByEmail(
  deps: {
    readonly authRepository: AuthRepository;
  },
  email: string,
  now: Date,
): ResultAsync<
  { readonly id: string; readonly email: string; readonly displayName: string },
  AppError
> {
  return safeTry(async function* () {
    const existing = yield* deps.authRepository.findUserByEmail(email);

    if (existing) {
      yield* deps.authRepository.updateUserLastLogin(existing.id, now);

      return ok({
        id: existing.id,
        email: existing.email,
        displayName: existing.displayName,
      });
    }

    const displayName = email.split("@")[0] || "User";
    const created = yield* deps.authRepository.createUser({
      email,
      displayName,
      now,
    });

    return ok({
      id: created.id,
      email: created.email,
      displayName: created.displayName,
    });
  });
}

export function verifyMagicLink(deps: {
  readonly authRepository: AuthRepository;
  readonly config: AuthConfig;
}) {
  return function verifyMagicLink(
    input: VerifyMagicLinkInputType,
    ctx: RequestContext,
  ): ResultAsync<
    {
      redirectPath: string;
      sessionToken: string;
      sessionId: string;
    },
    AppError
  > {
    return safeTry(async function* () {
      const tokenHash = sha256Hex(input.token);
      const now = new Date();

      // 1. 토큰 조회
      const record =
        yield* deps.authRepository.findMagicLinkTokenByHash(tokenHash);

      // 2. 토큰 유효성 검증
      if (!record) {
        return err(
          coreError({
            code: "MAGIC_LINK_INVALID",
            message: "유효하지 않은 토큰입니다.",
          }),
        );
      }
      if (record.consumedAt) {
        return err(
          coreError({
            code: "MAGIC_LINK_USED",
            message: "이미 사용된 토큰입니다.",
          }),
        );
      }
      if (record.expiresAt.getTime() < now.getTime()) {
        return err(
          coreError({
            code: "MAGIC_LINK_EXPIRED",
            message: "토큰이 만료되었습니다.",
          }),
        );
      }
      if (!validateRedirectPath(record.redirectPath)) {
        return err(
          coreError({
            code: "INVALID_REDIRECT",
            message: "redirectPath가 허용되지 않습니다.",
          }),
        );
      }

      // 3. 토큰 소비 처리
      yield* deps.authRepository.consumeMagicLinkToken(record.id, now);

      // 4. 사용자 조회/생성
      const user = yield* upsertUserByEmail(deps, record.email, now);

      // 5. 세션 생성
      const sessionToken = generateToken();
      const sessionTokenHash = sha256Hex(sessionToken);
      const expiresAt = computeSessionExpiresAt(
        now,
        deps.config.SESSION_DURATION_DAYS,
      );

      const session = yield* deps.authRepository.insertAuthSession({
        userId: user.id,
        sessionTokenHash,
        expiresAt,
        createdIp: ctx.ipAddress,
        userAgent: ctx.userAgent,
        createdAt: now,
      });

      return ok({
        redirectPath: record.redirectPath,
        sessionToken,
        sessionId: session.id,
      });
    });
  };
}
