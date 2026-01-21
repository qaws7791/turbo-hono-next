// Session Domain - Session Start View
// 세션 시작 중 표시되는 UI 컴포넌트

import { useSessionStart } from "../application/use-session-start";

interface SessionStartViewProps {
  sessionId: string;
}

/**
 * 세션 시작 상태를 표시하는 뷰 컴포넌트
 *
 * - 시작 중: 로딩 메시지 표시
 * - 에러: 에러 메시지 표시 후 홈으로 리다이렉트
 */
export function SessionStartView({ sessionId }: SessionStartViewProps) {
  const state = useSessionStart(sessionId);

  return (
    <div className="flex min-h-svh items-center justify-center">
      {state.status === "starting" && (
        <p className="text-muted-foreground">세션 시작 중...</p>
      )}
      {state.status === "error" && (
        <div className="text-center">
          <p className="text-destructive">세션을 시작할 수 없습니다.</p>
          <p className="text-muted-foreground mt-2 text-sm">
            잠시 후 홈으로 이동합니다...
          </p>
        </div>
      )}
    </div>
  );
}
