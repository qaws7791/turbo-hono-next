import type { PlanSessionType, SessionBlueprint, SessionStep } from "./schemas";

import { nowIso } from "~/foundation/lib/time";
import { randomUuidV4 } from "~/foundation/lib/uuid";

function timeProfile(targetMinutes: number): "MICRO" | "STANDARD" | "DEEP" {
  if (targetMinutes <= 10) return "MICRO";
  if (targetMinutes <= 25) return "STANDARD";
  return "DEEP";
}

function difficultyFromLevel(
  level: "novice" | "basic" | "intermediate" | "advanced",
): "beginner" | "intermediate" | "advanced" {
  if (level === "novice" || level === "basic") return "beginner";
  if (level === "intermediate") return "intermediate";
  return "advanced";
}

export function createSessionBlueprint(input: {
  planId: string;
  moduleId: string;
  planSessionId: string;
  sessionType: PlanSessionType;
  planTitle: string;
  moduleTitle: string;
  sessionTitle: string;
  targetMinutes: number;
  blueprintId?: string;
  level?: "novice" | "basic" | "intermediate" | "advanced";
  nextSessionTitle?: string;
}): SessionBlueprint {
  const blueprintId = input.blueprintId ?? randomUuidV4();
  const createdAt = nowIso();
  const profile = timeProfile(input.targetMinutes);
  const difficulty = difficultyFromLevel(input.level ?? "basic");

  return createDeepSessionBlueprint({
    ...input,
    blueprintId,
    createdAt,
    profile,
    difficulty,
  });
}

// ============================================================
// 딥 세션 (30분) - 본학습
// React 상태 관리: 함수형 업데이터와 배치 업데이트
// ============================================================
function createDeepSessionBlueprint(input: {
  planId: string;
  moduleId: string;
  planSessionId: string;
  sessionType: PlanSessionType;
  planTitle: string;
  moduleTitle: string;
  sessionTitle: string;
  targetMinutes: number;
  blueprintId: string;
  createdAt: string;
  profile: "MICRO" | "STANDARD" | "DEEP";
  difficulty: "beginner" | "intermediate" | "advanced";
  nextSessionTitle?: string;
}): SessionBlueprint {
  const steps: Array<SessionStep> = [
    // ============================================================
    // 1. 세션 인트로 (첫번째 고정)
    // ============================================================
    {
      id: "session-intro",
      type: "SESSION_INTRO",
      planTitle: input.planTitle,
      moduleTitle: input.moduleTitle,
      sessionTitle: input.sessionTitle,
      durationMinutes: input.targetMinutes,
      difficulty: input.difficulty,
      learningGoals: [
        "함수형 업데이터의 개념과 필요성 이해",
        "React 배치 업데이트 동작 원리 파악",
        "useReducer를 통한 복잡한 상태 관리",
        "실무에서 자주 발생하는 stale closure 문제 해결",
      ],
      questionsToCover: [
        "왜 setCount(count + 1)을 세 번 호출해도 1만 증가할까요?",
        "React 18의 자동 배칭이란 무엇인가요?",
        "언제 useState 대신 useReducer를 사용해야 할까요?",
        "stale closure 문제를 어떻게 방지할 수 있나요?",
      ],
      prerequisites: ["React 기초", "useState Hook", "이벤트 핸들링"],
      estimatedSeconds: 60,
      intent: "INTRO",
    },

    // ============================================================
    // 3. 이해도 체크: 4지선다 퀴즈
    // ============================================================
    {
      id: "check-1",
      type: "CHECK",
      question: "함수형 업데이터를 사용해야 하는 경우는 언제인가요?",
      options: [
        "항상 모든 setState에서 사용해야 한다",
        "새로운 값이 이전 상태에 의존할 때",
        "상태가 객체나 배열일 때만",
        "useEffect 내부에서만",
      ],
      answerIndex: 1,
      explanation:
        "새로운 상태 값이 이전 상태에 의존할 때 함수형 업데이터를 사용합니다. 예: 카운터 증가, 배열에 아이템 추가, 토글 등. 독립적인 새 값을 설정할 때는 필수가 아닙니다.",
      estimatedSeconds: 45,
      intent: "RETRIEVAL",
    },

    // ============================================================
    // 3. 이해도 체크: 플래시카드
    // ============================================================
    {
      id: "flashcard-1",
      type: "FLASHCARD",
      front:
        "setCount(count + 1)을 세 번 연속 호출했을 때 count가 1이 되는 이유는?",
      back: "JavaScript 클로저 때문!\n\n세 번의 호출 모두 같은 렌더링 컨텍스트의 count 값(0)을 참조합니다.\n\n해결: setCount(prev => prev + 1) 사용\n\n함수형 업데이터는 React가 '큐잉된 시점의 최신 상태'를 전달해주므로 정확히 동작합니다.",
      estimatedSeconds: 45,
      intent: "RETRIEVAL",
    },

    // ============================================================
    // 3. 이해도 체크: Cloze (빈칸 맞히기)
    // ============================================================
    {
      id: "cloze-1",
      type: "CLOZE",
      sentence:
        "배열에 새 아이템을 추가할 때: setItems({{blank}} => [...{{blank}}, newItem])",
      blankId: "prev",
      options: ["prev", "items", "state", "array"],
      answerIndex: 0,
      explanation:
        "함수형 업데이터에서 prev는 이전 상태를 나타내는 관례적인 이름입니다. 스프레드 연산자로 기존 배열을 복사하고 새 아이템을 추가합니다.",
      estimatedSeconds: 30,
      intent: "RETRIEVAL",
    },

    // ============================================================
    // 3. 이해도 체크: 스피드 O/X
    // ============================================================
    {
      id: "speed-ox-1",
      type: "SPEED_OX",
      statement:
        "React 18에서 setTimeout 내의 여러 setState 호출은 각각 별도의 렌더링을 유발한다.",
      isTrue: false,
      explanation:
        "틀렸습니다! React 18부터는 setTimeout, Promise 등 모든 컨텍스트에서 자동 배칭이 적용됩니다. 여러 setState 호출이 하나의 렌더링으로 묶입니다.",
      estimatedSeconds: 30,
      intent: "RETRIEVAL",
    },

    // ============================================================
    // 3. 이해도 체크: Matching (짝짓기)
    // ============================================================
    {
      id: "matching-1",
      type: "MATCHING",
      instruction: "왼쪽의 개념과 오른쪽의 설명을 연결하세요.",
      pairs: [
        {
          id: "pair-1",
          left: "함수형 업데이터",
          right: "prev => prev + 1",
        },
        {
          id: "pair-2",
          left: "배치 업데이트",
          right: "여러 setState를 하나의 렌더로 묶음",
        },
        {
          id: "pair-3",
          left: "Stale closure",
          right: "클로저가 오래된 값을 참조하는 문제",
        },
        {
          id: "pair-4",
          left: "flushSync",
          right: "배칭을 중단하고 즉시 렌더링",
        },
      ],
      estimatedSeconds: 60,
      intent: "RETRIEVAL",
    },

    // ============================================================
    // 4. 적용 활동 1
    // ============================================================
    {
      id: "application-1",
      type: "APPLICATION",
      scenario: `당신은 To-Do 앱을 개발하고 있습니다. 사용자가 "완료" 버튼을 클릭하면 다음 두 가지가 동시에 일어나야 합니다:
1. 해당 항목의 완료 상태 토글
2. 완료된 항목 수 카운터 업데이트

현재 코드는 빠른 더블클릭 시 카운터가 정확하지 않습니다.`,
      question: "이 문제를 해결하려면 어떻게 해야 할까요?",
      options: [
        "useState 대신 useRef를 사용한다",
        "setCompletedCount(prev => prev + 1)를 사용한다",
        "각 업데이트 사이에 setTimeout을 추가한다",
        "useEffect에서 카운터를 업데이트한다",
      ],
      correctIndex: 1,
      feedback:
        "정답입니다! 함수형 업데이터를 사용하면 연속 클릭에서도 각 업데이트가 올바른 이전 값을 기반으로 계산됩니다. useEffect는 의존성 관리가 복잡해지고, setTimeout/useRef는 React의 상태 관리 패턴에서 벗어납니다.",
      estimatedSeconds: 90,
      intent: "PRACTICE",
    },

    // ============================================================
    // 4. 적용 활동 2
    // ============================================================
    {
      id: "application-2",
      type: "APPLICATION",
      scenario: `폼에서 여러 필드(이름, 이메일, 전화번호)를 관리하고 있습니다. 
각 필드마다 별도의 useState를 사용하니 코드가 복잡해졌고, 
관련 상태들의 일관성을 유지하기 어렵습니다.
또한 "제출 중", "에러", "성공" 상태도 관리해야 합니다.`,
      question: "이 상황에서 가장 적절한 해결책은?",
      options: [
        "모든 상태를 하나의 거대한 객체로 useState에 저장",
        "useReducer로 상태와 액션을 명확히 분리",
        "각 필드마다 useRef 사용",
        "전역 상태 관리 라이브러리 도입",
      ],
      correctIndex: 1,
      feedback:
        "정답입니다! useReducer는 여러 상태가 서로 연관되어 있고 상태 전환 로직이 복잡할 때 적합합니다. 액션 기반으로 명확한 상태 전환을 정의할 수 있고, 테스트와 디버깅도 쉬워집니다.",
      estimatedSeconds: 90,
      intent: "PRACTICE",
    },

    // ============================================================
    // 5. 세션 요약 (마지막 고정)
    // ============================================================
    {
      id: "session-summary",
      type: "SESSION_SUMMARY",
      celebrationEmoji: "🎉",
      encouragement: "멋져요! React 상태 관리의 핵심을 완벽히 학습했습니다!",
      completedActivities: [
        "개념 학습 3챕터",
        "4지선다 퀴즈 1개",
        "플래시카드 1개",
        "빈칸 채우기 1개",
        "O/X 퀴즈 1개",
        "짝짓기 1개",
        "적용 문제 2개",
      ],
      keyTakeaways: [
        "함수형 업데이터: prev => newValue로 stale state 방지",
        "배치 업데이트: React 18에서 모든 곳에서 자동 적용",
        "useReducer: 복잡한 상태 로직을 명확하게 관리",
        "핵심 질문: '이전 값이 필요한가?' → 함수형 업데이터 사용",
      ],
      nextSessionPreview: input.nextSessionTitle
        ? {
            title: input.nextSessionTitle,
            description: "useEffect와 데이터 페칭 패턴을 다룹니다.",
          }
        : undefined,
      estimatedSeconds: 45,
      intent: "WRAPUP",
    },
  ];

  return {
    schemaVersion: 1,
    blueprintId: input.blueprintId,
    createdAt: input.createdAt,
    context: {
      planId: input.planId,
      moduleId: input.moduleId,
      planSessionId: input.planSessionId,
      sessionType: input.sessionType,
    },
    timeBudget: {
      targetMinutes: input.targetMinutes,
      minMinutes: Math.max(5, Math.floor(input.targetMinutes * 0.6)),
      maxMinutes: Math.min(120, Math.ceil(input.targetMinutes * 1.4)),
      profile: input.profile,
    },
    startStepId: "session-intro",
    steps,
  };
}
