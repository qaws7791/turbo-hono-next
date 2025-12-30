import { err, ok } from "neverthrow";

import { CONFIG } from "../../../lib/config";
import { ApiError } from "../../../middleware/error-handler";
import { RequestMagicLinkInput } from "../auth.dto";
import { insertMagicLinkToken, sendLoginLinkEmail } from "../auth.repository";
import { generateToken, sha256Hex, validateRedirectPath } from "../auth.utils";

import type { Result } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type { RequestMagicLinkInput as RequestMagicLinkInputType } from "../auth.dto";
import type { RequestContext } from "../types";

const MAGIC_LINK_TTL_MS = 15 * 60 * 1000;

export async function requestMagicLink(
  input: RequestMagicLinkInputType,
  ctx: RequestContext,
): Promise<Result<{ message: string }, AppError>> {
  // 1. 입력 검증
  const parseResult = RequestMagicLinkInput.safeParse(input);
  if (!parseResult.success) {
    return err(
      new ApiError(400, "VALIDATION_ERROR", parseResult.error.message),
    );
  }
  const validated = parseResult.data;

  // 2. redirectPath 검증
  if (!validateRedirectPath(validated.redirectPath)) {
    return err(
      new ApiError(
        400,
        "INVALID_REDIRECT",
        "redirectPath가 허용되지 않습니다.",
      ),
    );
  }

  // 3. 토큰 생성
  const token = generateToken();
  const tokenHash = sha256Hex(token);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + MAGIC_LINK_TTL_MS);

  // 4. 토큰 저장
  const insertResult = await insertMagicLinkToken({
    email: validated.email,
    tokenHash,
    expiresAt,
    redirectPath: validated.redirectPath,
    createdIp: ctx.ipAddress,
    userAgent: ctx.userAgent,
    createdAt: now,
  });
  if (insertResult.isErr()) return err(insertResult.error);

  // 5. 검증 URL 생성
  const verifyUrl = new URL("/api/auth/magic-link/verify", CONFIG.BASE_URL);
  verifyUrl.searchParams.set("token", token);

  // 6. 이메일 발송
  const sendResult = await sendLoginLinkEmail({
    email: validated.email,
    verifyUrl: verifyUrl.toString(),
  });
  if (sendResult.isErr()) return err(sendResult.error);

  return ok({ message: "로그인 링크가 이메일로 전송되었습니다." });
}
