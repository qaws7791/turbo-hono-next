import { SessionBlueprint } from "./session.dto";
import { isoDateTime } from "./session.utils";

import type {
  PlanSessionType,
  SessionBlueprint as SessionBlueprintType,
  SessionStep,
} from "./session.dto";

type BuildSessionBlueprintInput = Readonly<{
  sessionType: PlanSessionType;
  planTitle: string;
  moduleTitle: string;
  sessionTitle: string;
  objective: string | null;
  estimatedMinutes: number;
  createdAt: Date;
}>;

export function buildSessionBlueprint(
  input: BuildSessionBlueprintInput,
): SessionBlueprintType {
  const steps = buildSteps(input);
  return SessionBlueprint.parse({
    schemaVersion: 1,
    blueprintId: crypto.randomUUID(),
    createdAt: isoDateTime(input.createdAt),
    steps,
    startStepIndex: 0,
  });
}

function buildSteps(input: BuildSessionBlueprintInput): Array<SessionStep> {
  if (input.sessionType === "REVIEW") {
    return buildReviewSteps(input);
  }
  return buildLearnSteps(input);
}

function buildLearnSteps(
  input: BuildSessionBlueprintInput,
): Array<SessionStep> {
  const objective = input.objective?.trim().length
    ? input.objective.trim()
    : null;

  return [
    {
      id: "session-intro",
      type: "SESSION_INTRO",
      planTitle: input.planTitle,
      moduleTitle: input.moduleTitle,
      sessionTitle: input.sessionTitle,
      durationMinutes: input.estimatedMinutes,
      difficulty: "beginner",
      learningGoals: objective
        ? [objective].slice(0, 5)
        : [
            `${input.sessionTitle}의 핵심 개념 이해`,
            "개념을 실제 예제로 연결",
            "짧은 퀴즈로 이해도 확인",
          ],
      questionsToCover: [
        `${input.sessionTitle}에서 가장 중요한 정의는 무엇인가요?`,
        `${input.sessionTitle}를 사용할 때 주의할 점은 무엇인가요?`,
        `실무에서는 ${input.sessionTitle}가 어떤 문제를 해결하나요?`,
      ],
      prerequisites: [],
      estimatedSeconds: 30,
      intent: "INTRO",
    },
    {
      id: "check-1",
      type: "CHECK",
      question: `${input.sessionTitle}에 대한 설명으로 가장 적절한 것은?`,
      options: [
        "핵심 정의를 한 문장으로 요약한다",
        "항상 성능을 2배로 올려준다",
        "어떤 상황에서도 정답이 하나로 고정된다",
        "별도의 문맥 없이도 항상 동일하게 동작한다",
      ],
      answerIndex: 0,
      explanation:
        "이 단계에서는 ‘정의’를 먼저 정확히 잡는 것이 목표입니다. 나머지 선택지는 일반화/과장된 표현입니다.",
      estimatedSeconds: 45,
      intent: "RETRIEVAL",
    },
    {
      id: "application-1",
      type: "APPLICATION",
      scenario: `당신은 ${input.sessionTitle}를 처음 적용하려고 합니다.`,
      question:
        "다음 중 ‘개념을 실제 코드/업무 상황에 연결’하는 가장 좋은 접근은?",
      options: [
        "작은 예제로 개념을 적용해보고 결과를 비교한다",
        "복잡한 프로젝트에 바로 대규모로 도입한다",
        "정의는 건너뛰고 에러가 나면 그때 검색한다",
      ],
      correctIndex: 0,
      feedback:
        "작은 예제로 검증하면 리스크를 줄이면서도 개념을 빠르게 체득할 수 있습니다.",
      estimatedSeconds: 60,
      intent: "PRACTICE",
    },
    {
      id: "session-summary",
      type: "SESSION_SUMMARY",
      celebrationEmoji: "🎉",
      encouragement:
        "좋습니다. 다음 세션으로 넘어가기 전에 핵심만 1분 복기해보세요.",
      completedActivities: ["개념 읽기", "퀴즈", "적용 시나리오"],
      keyTakeaways: [
        `${input.sessionTitle}의 정의를 말할 수 있다`,
        `적용하기 좋은/피해야 할 상황을 구분할 수 있다`,
        "작은 예제로 빠르게 검증하는 습관을 만든다",
      ],
      nextSessionPreview: {
        title: "다음 세션",
        description: "이어서 난이도를 한 단계 올려봅니다.",
      },
      estimatedSeconds: 30,
      intent: "WRAPUP",
    },
  ];
}

function buildReviewSteps(
  input: BuildSessionBlueprintInput,
): Array<SessionStep> {
  return [
    {
      id: "session-intro",
      type: "SESSION_INTRO",
      planTitle: input.planTitle,
      moduleTitle: input.moduleTitle,
      sessionTitle: input.sessionTitle,
      durationMinutes: input.estimatedMinutes,
      difficulty: "beginner",
      learningGoals: [
        "핵심 정의를 빠르게 복기",
        "실수하기 쉬운 포인트 점검",
        "짧은 회상 테스트로 기억 강화",
      ],
      questionsToCover: [
        "핵심 용어를 한 문장으로 설명할 수 있나요?",
        "주의할 점 1가지를 말할 수 있나요?",
        "언제/왜 쓰는지 사례를 떠올릴 수 있나요?",
      ],
      prerequisites: [],
      estimatedSeconds: 20,
      intent: "INTRO",
    },
    {
      id: "flashcard-1",
      type: "FLASHCARD",
      front: `${input.sessionTitle}의 핵심 정의를 1문장으로 말해보세요.`,
      back: `정답이 하나로 고정되기보다는, “정의 → 이유 → 예시” 순서로 설명해보는 것이 좋습니다.\n\n- 정의: 무엇인가?\n- 이유: 왜 필요한가?\n- 예시: 어디에 쓰는가?`,
      estimatedSeconds: 45,
      intent: "RETRIEVAL",
    },
    {
      id: "speed-ox-1",
      type: "SPEED_OX",
      statement: `${input.sessionTitle}는(은) 맥락과 무관하게 항상 동일한 결과를 보장한다.`,
      isTrue: false,
      explanation:
        "대부분의 개념은 ‘언제/어떤 조건에서’가 중요합니다. 맥락을 함께 기억하세요.",
      estimatedSeconds: 30,
      intent: "RETRIEVAL",
    },
    {
      id: "session-summary",
      type: "SESSION_SUMMARY",
      celebrationEmoji: "✅",
      encouragement: "복습 완료. 오늘 큐에서 다음 항목을 이어서 처리해보세요.",
      completedActivities: ["플래시카드", "스피드 O/X"],
      keyTakeaways: [
        "정의를 빠르게 회상할 수 있다",
        "과도한 일반화를 피한다",
        "맥락(언제/왜)을 함께 기억한다",
      ],
      estimatedSeconds: 20,
      intent: "WRAPUP",
    },
  ];
}
