// Session Domain - Validators
// 세션 라우트 파라미터 검증 로직

import { PublicIdSchema } from "~/foundation/lib";

const RunIdSchema = PublicIdSchema;
const SessionIdSchema = PublicIdSchema;

export type SessionLoaderResult =
  | { mode: "run"; runId: string }
  | { mode: "start"; sessionId: string };

/**
 * URL에서 세션 관련 파라미터를 파싱하고 검증합니다.
 *
 * - `runId`가 있으면 기존 실행을 이어서 진행 (mode: "run")
 * - `sessionId`만 있으면 새 세션 시작 (mode: "start")
 *
 * @throws Response 400 - sessionId가 없거나 유효하지 않은 경우
 * @throws Response 404 - runId가 유효하지 않은 경우
 */
export function parseSessionParams(request: Request): SessionLoaderResult {
  const url = new URL(request.url);
  const runIdRaw = url.searchParams.get("runId");
  const sessionIdRaw = url.searchParams.get("sessionId");

  // runId가 있으면 기존 실행 재개
  if (runIdRaw) {
    const runId = RunIdSchema.safeParse(runIdRaw);
    if (!runId.success) {
      throw new Response("Not Found", { status: 404 });
    }
    return { mode: "run", runId: runId.data };
  }

  // sessionId로 새 세션 시작
  const sessionId = SessionIdSchema.safeParse(sessionIdRaw);
  if (!sessionId.success) {
    throw new Response("Bad Request", { status: 400 });
  }

  return { mode: "start", sessionId: sessionId.data };
}
