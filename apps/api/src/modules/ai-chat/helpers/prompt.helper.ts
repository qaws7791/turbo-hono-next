import type { LearningPlanDetailResponse } from "../../learning-plan/services/learning-plan.query.service";

export interface ModuleSummary {
  id: string;
  title: string;
  description: string | null;
}

/**
 * Compose system prompt for AI tutor
 */
export function composeSystemPrompt(planContext: string): string {
  const currentDate = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
    timeZone: "Asia/Seoul",
  });

  return `당신은 학습 계획을 관리하고 학습자를 돕는 AI 튜터입니다.

오늘 날짜: ${currentDate}

현재 학습자의 학습 계획:
${planContext}

당신의 역할:
1. 학습 계획, 모듈, 태스크에 대한 질문에 답변합니다.
2. 학습 진도를 확인하고 피드백을 제공합니다.
3. 필요시 모듈이나 태스크를 생성, 수정, 삭제할 수 있습니다.
4. 학습자가 요청하면 학습 계획을 조정할 수 있습니다.

주의사항:
- 한국어로 친절하고 명확하게 답변하세요.
- 학습자의 학습 목표와 진도를 고려하여 조언하세요.
- 도구를 사용할 때는 반드시 학습자에게 무엇을 하는지 설명하세요.
- 학습 계획을 수정할 때는 학습자의 동의를 먼저 구하세요.`;
}

/**
 * Format learning plan and modules into context string
 */
export function formatPlanContext(
  learningPlan: LearningPlanDetailResponse,
  modules: Array<ModuleSummary>,
): string {
  const moduleDescription = modules
    .map((module) => {
      const description = module.description ? `: ${module.description}` : "";
      return `- ${module.title} (ID: ${module.id})${description}`;
    })
    .join("\n");

  return `학습 계획 정보:
- 제목: ${learningPlan.title}
- 학습 주제: ${learningPlan.learningTopic}
- 목표 기간: ${learningPlan.targetWeeks}주
- 주간 학습 시간: ${learningPlan.weeklyHours}시간
- 사용자 레벨: ${learningPlan.userLevel}
- 학습 계획 ID: ${learningPlan.id}

모듈 구조:
${moduleDescription}`;
}
