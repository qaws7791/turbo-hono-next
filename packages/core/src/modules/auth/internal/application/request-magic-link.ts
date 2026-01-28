import { err, ok, safeTry } from "neverthrow";

import { coreError } from "../../../../common/core-error";
import {
  generateToken,
  sha256Hex,
  validateRedirectPath,
} from "../domain/auth.utils";

import type { Result, ResultAsync } from "neverthrow";
import type { AppError } from "../../../../common/result";
import type { AuthConfig } from "../../api/config";
import type { RequestMagicLinkInput as RequestMagicLinkInputType } from "../../api/schema";
import type { RequestContext } from "../../api/types";
import type { AuthRepository } from "../infrastructure/auth.repository";

const MAGIC_LINK_TTL_MS = 10 * 60 * 1000;

function buildVerifyUrl(
  baseUrl: string,
  token: string,
): Result<string, AppError> {
  try {
    const url = new URL("/api/auth/magic-link/verify", baseUrl);
    url.searchParams.set("token", token);
    return ok(url.toString());
  } catch {
    return err(
      coreError({
        code: "INVALID_BASE_URL",
        message: "BASE_URL 설정이 올바르지 않습니다.",
        details: { baseUrl },
      }),
    );
  }
}

export function requestMagicLink(deps: {
  readonly authRepository: AuthRepository;
  readonly config: AuthConfig;
}) {
  return function requestMagicLink(
    input: RequestMagicLinkInputType,
    ctx: RequestContext,
  ): ResultAsync<{ message: string }, AppError> {
    return safeTry(async function* () {
      if (!validateRedirectPath(input.redirectPath)) {
        return err(
          coreError({
            code: "INVALID_REDIRECT",
            message: "redirectPath가 허용되지 않습니다.",
          }),
        );
      }

      const token = generateToken();
      const tokenHash = sha256Hex(token);
      const now = new Date();
      const expiresAt = new Date(now.getTime() + MAGIC_LINK_TTL_MS);

      yield* deps.authRepository.insertMagicLinkToken({
        email: input.email,
        tokenHash,
        expiresAt,
        redirectPath: input.redirectPath,
        createdIp: ctx.ipAddress,
        userAgent: ctx.userAgent,
        createdAt: now,
      });

      const verifyUrl = yield* buildVerifyUrl(deps.config.BASE_URL, token);

      yield* deps.authRepository.sendLoginLinkEmail({
        email: input.email,
        verifyUrl,
      });

      return ok({ message: "로그인 링크가 이메일로 전송되었습니다." });
    });
  };
}
