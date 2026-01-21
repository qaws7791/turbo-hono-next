// Session Domain - Use Session Start Hook
// 세션 시작 로직을 캡슐화한 커스텀 훅

import * as React from "react";
import { useNavigate } from "react-router";

import { useCreateOrResumeSessionRunMutation } from "./use-create-or-resume-session-run-mutation";

export type SessionStartState = {
  status: "starting" | "error";
  error?: Error;
};

/**
 * 세션 시작 로직을 관리하는 훅
 *
 * - 마운트 시 자동으로 세션 런을 생성/재개
 * - 성공 시 세션 실행 페이지로 네비게이션
 * - 실패 시 에러 상태 반환 및 홈으로 리다이렉트
 */
export function useSessionStart(sessionId: string): SessionStartState {
  const navigate = useNavigate();
  const { createOrResumeSessionRun } = useCreateOrResumeSessionRunMutation();
  const [state, setState] = React.useState<SessionStartState>({
    status: "starting",
  });

  React.useEffect(() => {
    let cancelled = false;

    createOrResumeSessionRun(sessionId)
      .then(({ runId }) => {
        if (cancelled) return;
        navigate(`/session?runId=${encodeURIComponent(runId)}`, {
          replace: true,
        });
      })
      .catch((error) => {
        if (cancelled) return;
        setState({
          status: "error",
          error: error instanceof Error ? error : new Error(String(error)),
        });
        // 잠시 후 홈으로 리다이렉트
        setTimeout(() => {
          if (!cancelled) {
            navigate("/home", { replace: true });
          }
        }, 2000);
      });

    return () => {
      cancelled = true;
    };
  }, [createOrResumeSessionRun, navigate, sessionId]);

  return state;
}
