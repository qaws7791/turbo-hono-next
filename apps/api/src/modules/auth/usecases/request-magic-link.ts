import { err, ok, safeTry } from "neverthrow";

import { ApiError } from "../../../middleware/error-handler";
import { generateToken, sha256Hex, validateRedirectPath } from "../auth.utils";

import type { Result, ResultAsync } from "neverthrow";
import type { Config } from "../../../lib/config";
import type { AppError } from "../../../lib/result";
import type { RequestMagicLinkInput as RequestMagicLinkInputType } from "../auth.dto";
import type { AuthRepository } from "../auth.repository";
import type { RequestContext } from "../types";

const MAGIC_LINK_TTL_MS = 10 * 60 * 1000;

function buildVerifyUrl(
  baseUrl: string,
  token: string,
): Result<string, ApiError> {
  try {
    const url = new URL("/api/auth/magic-link/verify", baseUrl);
    url.searchParams.set("token", token);
    return ok(url.toString());
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

export function requestMagicLink(deps: {
  readonly authRepository: AuthRepository;
  readonly config: Config;
}) {
  return function requestMagicLink(
    input: RequestMagicLinkInputType,
    ctx: RequestContext,
  ): ResultAsync<{ message: string }, AppError> {
    return safeTry(async function* () {
      if (!validateRedirectPath(input.redirectPath)) {
        return err(
          new ApiError(
            400,
            "INVALID_REDIRECT",
            "redirectPath가 허용되지 않습니다.",
          ),
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
