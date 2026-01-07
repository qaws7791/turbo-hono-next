// Session Domain - Session Route View
// 세션 라우트의 메인 뷰 컴포넌트

import { SessionRunView } from "./session-run-view";
import { SessionStartView } from "./session-start-view";

import type { SessionLoaderResult } from "../application/session.validators";

interface SessionRouteViewProps {
  loaderData: SessionLoaderResult;
}

/**
 * 세션 라우트의 통합 뷰 컴포넌트
 *
 * 로더 데이터의 mode에 따라 적절한 뷰를 렌더링합니다:
 * - "start": 세션 시작 뷰 (세션 런 생성/재개)
 * - "run": 세션 실행 뷰 (학습 진행)
 */
export function SessionRouteView({ loaderData }: SessionRouteViewProps) {
  if (loaderData.mode === "start") {
    return <SessionStartView sessionId={loaderData.sessionId} />;
  }

  return <SessionRunView runId={loaderData.runId} />;
}
