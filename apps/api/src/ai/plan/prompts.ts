import type { PlanGoalType, PlanLevel } from "./types";

const GOAL_TYPE_LABELS: Record<PlanGoalType, string> = {
  JOB: "취업/이직 준비",
  CERT: "자격증 취득",
  WORK: "업무 역량 강화",
  HOBBY: "취미/자기계발",
  OTHER: "기타 학습",
};

const LEVEL_LABELS: Record<PlanLevel, string> = {
  BEGINNER: "입문자 (해당 분야 경험 없음)",
  INTERMEDIATE: "중급자 (기본 개념 이해, 실습 경험 있음)",
  ADVANCED: "고급자 (실무 경험 있음, 심화 학습 필요)",
};

const LEVEL_CONSIDERATIONS: Record<PlanLevel, string> = {
  BEGINNER: `
- 기초 개념부터 차근차근 설명
- 전문 용어는 쉬운 설명과 함께 제공
- 실습보다 이해 위주의 학습 권장`,
  INTERMEDIATE: `
- 기본 개념은 간략히 확인
- 실습과 응용에 더 많은 시간 배분
- 심화 개념으로의 연결 고리 제공
- 실제 사례 기반 학습 권장`,
  ADVANCED: `
- 기초 설명 최소화, 핵심 포인트 집중
- 고급 기법과 최적화 전략 중심
- 실무 적용 시나리오 위주
- 최신 트렌드와 베스트 프랙티스 포함`,
};

export function buildSystemPrompt(): string {
  return `당신은 전문 학습 플래너 AI입니다.
사용자가 제공한 학습 자료의 내용을 분석하고, 개인의 수준과 목표에 맞는 최적의 학습 계획을 생성합니다.

## 역할
1. 학습 자료 내용을 깊이 이해하고 핵심 개념을 파악합니다.
2. 사용자의 현재 수준에 맞게 난이도를 조절합니다.
3. 학습 목표를 고려하여 효과적인 커리큘럼을 설계합니다.

## 규칙
- 각 세션은 25~50분 단위로 구성합니다.
- 하루에 1~3개의 세션을 배치합니다.
- 모든 응답은 한국어로 작성합니다.
- 세션 목표(objective)는 구체적이고 측정 가능하게 작성합니다.`;
}

export function buildUserPrompt(params: {
  readonly goalType: PlanGoalType;
  readonly currentLevel: PlanLevel;
  readonly targetDueDate: Date;
  readonly specialRequirements: string | null;
  readonly materialContexts: ReadonlyArray<{
    readonly materialTitle: string;
    readonly content: string;
  }>;
  readonly materialCount: number;
}): string {
  const dueDate = params.targetDueDate.toISOString().slice(0, 10);
  const today = new Date().toISOString().slice(0, 10);

  const materialsSection = params.materialContexts
    .map(
      (ctx, idx) => `
### 자료 ${idx + 1}: ${ctx.materialTitle}
\`\`\`
${ctx.content}
\`\`\``,
    )
    .join("\n");

  const requirementsSection = params.specialRequirements
    ? `
## 특별 요구사항
${params.specialRequirements}`
    : "";

  return `## 학습 계획 생성 요청

### 기본 정보
- **학습 목표**: ${GOAL_TYPE_LABELS[params.goalType]}
- **현재 수준**: ${LEVEL_LABELS[params.currentLevel]}
- **오늘 날짜**: ${today}
- **목표 완료일**: ${dueDate}
- **자료 개수**: ${params.materialCount}개

### 수준별 고려사항
${LEVEL_CONSIDERATIONS[params.currentLevel]}
${requirementsSection}

## 학습 자료 내용
${materialsSection}

## 요청
위 자료 내용과 사용자 정보를 바탕으로 개인화된 학습 계획을 생성해주세요.

응답은 반드시 아래 JSON 형식을 따라주세요:
\`\`\`json
{
  "title": "계획 제목 (예: JavaScript 기초 마스터하기)",
  "summary": "계획 요약 설명 (2-3문장)",
  "modules": [
    {
      "title": "모듈 제목",
      "description": "모듈 설명",
      "orderIndex": 0,
      "materialIndex": 0
    }
  ],
  "sessions": [
    {
      "sessionType": "LEARN",
      "title": "세션 제목",
      "objective": "구체적인 학습 목표",
      "estimatedMinutes": 30,
      "dayOffset": 0,
      "moduleIndex": 0
    }
  ]
}
\`\`\`

### JSON 필드 설명
- modules.materialIndex: 0부터 시작하는 자료 인덱스 (자료 순서 그대로)
- sessions.sessionType: "LEARN" (학습)
- sessions.dayOffset: 오늘(0)부터 시작하는 일 수
- sessions.moduleIndex: 해당 세션이 속한 모듈의 인덱스

중요: JSON 외의 텍스트는 포함하지 마세요.`;
}

// ============================================
// 2단계 파이프라인용 프롬프트
// ============================================

/**
 * 1단계: 구조 설계를 위한 시스템 프롬프트
 */
export function buildStructurePlanningSystemPrompt(): string {
  return `당신은 전문 학습 플래너 AI입니다.
제공된 학습 자료의 메타정보(분량, 청크 수 등)를 바탕으로 최적의 학습 구조를 설계합니다.

## 세션 수 결정 가이드라인
- 청크 2~3개당 1세션 권장 (청크 1개 ≈ 약 1000자, 학습 시간 약 5분)
- 최소 1세션, 최대 90세션
- 사용자가 세션 수를 지정한 경우 해당 값을 존중하되, 지나치게 비현실적이면 적절히 조절
  예) 청크 2개인데 50세션 요청 → 2~3세션으로 조절하고 reasoning에 이유 설명

## 세션 배치 원칙
- 하루 1~3세션 배치
- 각 세션 25~50분
- 자료(모듈)별로 세션 균등 분배
`;
}

/**
 * 1단계: 구조 설계를 위한 사용자 프롬프트
 */
export function buildStructurePlanningUserPrompt(params: {
  readonly goalType: PlanGoalType;
  readonly currentLevel: PlanLevel;
  readonly targetDueDate: Date;
  readonly specialRequirements: string | null;
  readonly requestedSessionCount: number | null;
  readonly materials: ReadonlyArray<{
    readonly title: string;
    readonly chunkCount: number;
  }>;
  readonly totalChunkCount: number;
}): string {
  const dueDate = params.targetDueDate.toISOString().slice(0, 10);
  const today = new Date().toISOString().slice(0, 10);

  const materialsSection = params.materials
    .map(
      (mat, idx) =>
        `- 자료 ${idx + 1}: "${mat.title}" (청크 ${mat.chunkCount}개, 예상 ${mat.chunkCount * 5}분)`,
    )
    .join("\n");

  const sessionCountHint = params.requestedSessionCount
    ? `사용자 희망 세션 수: ${params.requestedSessionCount}개`
    : `학습량에 맞춤 (AI가 적절한 세션 수 결정)`;

  const recommendedSessions = Math.max(
    1,
    Math.min(90, Math.ceil(params.totalChunkCount / 2.5)),
  );

  return `## 학습 구조 설계 요청

### 기본 정보
- **학습 목표**: ${GOAL_TYPE_LABELS[params.goalType]}
- **현재 수준**: ${LEVEL_LABELS[params.currentLevel]}
- **오늘 날짜**: ${today}
- **목표 완료일**: ${dueDate}
- **${sessionCountHint}**

### 자료 분량 정보
${materialsSection}
- **총 청크 수**: ${params.totalChunkCount}개
- **권장 세션 수**: ${recommendedSessions}개 (청크 2~3개당 1세션 기준)

### 수준별 고려사항
${LEVEL_CONSIDERATIONS[params.currentLevel]}
${params.specialRequirements ? `\n### 특별 요구사항\n${params.specialRequirements}` : ""}

## 요청
위 정보를 바탕으로 최적의 학습 구조를 설계해주세요.`;
}

/**
 * 2단계: 세션 상세화를 위한 시스템 프롬프트
 */
export function buildSessionPopulationSystemPrompt(): string {
  return `당신은 학습 세션 설계 전문가입니다.
제공된 학습 자료 청크를 바탕으로 세션의 제목과 학습 목표를 구체화합니다.

## 세션 설계 원칙
- 제목: 구체적이고 동기부여가 되는 표현 (예: "핵심 개념 마스터하기")
- 목표: SMART 원칙에 따라 측정 가능하게 작성
- 모든 응답은 한국어로 작성

## 응답 형식
반드시 JSON 형식으로 응답하세요.`;
}

/**
 * 2단계: 세션 상세화를 위한 사용자 프롬프트
 */
export function buildSessionPopulationUserPrompt(params: {
  readonly moduleTitle: string;
  readonly sessionIndex: number;
  readonly totalSessions: number;
  readonly topicHint: string;
  readonly chunkContents: ReadonlyArray<string>;
  readonly currentLevel: PlanLevel;
}): string {
  const chunksSection = params.chunkContents
    .map((content, idx) => `### 청크 ${idx + 1}\n${content}`)
    .join("\n\n");

  return `## 세션 상세화 요청

### 세션 정보
- **모듈**: ${params.moduleTitle}
- **세션**: ${params.sessionIndex + 1}/${params.totalSessions}
- **주제 힌트**: ${params.topicHint}
- **학습자 수준**: ${LEVEL_LABELS[params.currentLevel]}

### 학습 자료 내용
${chunksSection}

## 요청
위 내용을 바탕으로 세션의 제목과 학습 목표를 작성해주세요.

응답은 반드시 아래 JSON 형식을 따라주세요:
\`\`\`json
{
  "title": "세션 제목 (구체적이고 동기부여가 되는 표현)",
  "objective": "학습 목표 (SMART 원칙에 따라 측정 가능하게)"
}
\`\`\`

중요: JSON 외의 텍스트는 포함하지 마세요.`;
}
