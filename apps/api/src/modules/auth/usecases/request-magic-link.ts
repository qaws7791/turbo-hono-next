import { ApiError } from "../../../middleware/error-handler";
import { throwAppError, tryPromise } from "../../../lib/result";
import { generateToken, sha256Hex, validateRedirectPath } from "../auth.utils";

import type { ResultAsync } from "neverthrow";
import type { Config } from "../../../lib/config";
import type { AppError } from "../../../lib/result";
import type { RequestMagicLinkInput as RequestMagicLinkInputType } from "../auth.dto";
import type { AuthRepository } from "../auth.repository";
import type { RequestContext } from "../types";

const MAGIC_LINK_TTL_MS = 15 * 60 * 1000;

export function requestMagicLink(deps: {
  readonly authRepository: AuthRepository;
  readonly config: Config;
}) {
  return function requestMagicLink(
    input: RequestMagicLinkInputType,
    ctx: RequestContext,
  ): ResultAsync<{ message: string }, AppError> {
    return tryPromise(async () => {
      // 1. redirectPath 검증
      if (!validateRedirectPath(input.redirectPath)) {
        throw new ApiError(
          400,
          "INVALID_REDIRECT",
          "redirectPath가 허용되지 않습니다.",
        );
      }

      // 2. 토큰 생성
      const token = generateToken();
      const tokenHash = sha256Hex(token);
      const now = new Date();
      const expiresAt = new Date(now.getTime() + MAGIC_LINK_TTL_MS);

      // 3. 토큰 저장
      await deps.authRepository
        .insertMagicLinkToken({
          email: input.email,
          tokenHash,
          expiresAt,
          redirectPath: input.redirectPath,
          createdIp: ctx.ipAddress,
          userAgent: ctx.userAgent,
          createdAt: now,
        })
        .match(
          () => undefined,
          (error) => {
            throwAppError(error);
          },
        );

      // 4. 검증 URL 생성
      const verifyUrl = new URL(
        "/api/auth/magic-link/verify",
        deps.config.BASE_URL,
      );
      verifyUrl.searchParams.set("token", token);

      // 5. 이메일 발송
      await deps.authRepository
        .sendLoginLinkEmail({
          email: input.email,
          verifyUrl: verifyUrl.toString(),
        })
        .match(
          () => undefined,
          (error) => {
            throwAppError(error);
          },
        );

      return { message: "로그인 링크가 이메일로 전송되었습니다." };
    });
  };
}
