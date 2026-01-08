import type {
  PlanDetailQueueItem,
  PlanGoal,
  PlanLevel,
  PlanSession,
  PlanWithDerived,
} from "./types";

/**
 * 세션 목록에서 모듈 진행률(%)을 계산합니다.
 */
export function calculateModuleProgress(sessions: Array<PlanSession>): number {
  const total = sessions.length;
  if (total === 0) return 0;
  const completed = sessions.filter((s) => s.status === "completed").length;
  return Math.round((completed / total) * 100);
}

export function getPlanGoalLabel(goal: PlanGoal): string {
  const labels: Record<PlanGoal, string> = {
    career: "취업/이직",
    certificate: "자격증",
    work: "업무 활용",
    hobby: "자기계발/취미",
  };
  return labels[goal];
}

export function getPlanLevelLabel(level: PlanLevel): string {
  const labels: Record<PlanLevel, string> = {
    novice: "입문",
    basic: "초급",
    intermediate: "중급",
    advanced: "고급",
  };
  return labels[level];
}

/**
 * 플랜에서 다음 수행할 세션 큐를 계산합니다.
 * - 완료되지 않은 세션만 필터링
 * - 예정일 기준 정렬
 * - 최대 3개까지 반환
 */
export function selectNextQueue(
  plan: PlanWithDerived,
): Array<PlanDetailQueueItem> {
  return plan.modules
    .flatMap((m) => m.sessions)
    .filter((session) => session.status !== "completed")
    .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate))
    .slice(0, 3)
    .map((session) => ({
      href: `/session?sessionId=${encodeURIComponent(session.id)}`,
    }));
}
