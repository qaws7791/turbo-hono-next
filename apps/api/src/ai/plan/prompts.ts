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

// ============================================
// 2단계 파이프라인용 프롬프트
// ============================================

/**
 * 1단계: 구조 설계를 위한 시스템 프롬프트
 * - 모듈 구조 설계에 집중 (sessionSkeletons 제거)
 * - 각 모듈에 sessionCount를 배정하여 2단계에서 모듈 단위로 세션 생성
 */
export function buildStructurePlanningSystemPrompt(): string {
  return `당신은 전문 학습 플래너 AI입니다.
제공된 학습 자료의 메타정보(분량, 청크 수 등)와 문서 구조를 바탕으로 최적의 학습 모듈 구조를 설계합니다.

## 모듈 설계 원칙
- 각 모듈은 논리적으로 연관된 주제들을 묶습니다
- 모듈별로 1~10개의 세션을 배정합니다 (sessionCount)
- 모듈의 chunkRange는 해당 모듈이 담당하는 자료의 범위입니다

## 세션 수 분배 가이드라인
- 청크 2~3개당 1세션 권장 (청크 1개 ≈ 약 1000자, 학습 시간 약 5분)
- 모듈별 청크 분량에 비례하여 sessionCount를 할당하세요
- 모든 모듈의 sessionCount 합이 전체 권장 세션 수와 근접해야 합니다
- 사용자가 세션 수를 지정한 경우 해당 값을 존중하되, 비현실적이면 적절히 조절

## 문서 구조 활용 원칙
- 문서 지도(outline)를 참고하여 모듈의 논리적 경계를 결정하세요
- chunkRange는 실제 분량 배분을 위한 용도입니다.
- **매우 중요**: 각 자료의 chunkRange는 0부터 시작하여 (chunkCount - 1) 사이여야 합니다. 범위를 벗어나는 인덱스를 지정하지 마세요.
- **매우 중요**: start와 end는 포함(inclusive) 관계입니다. (예: 0~2는 0, 1, 2번 청크를 의미)
`;
}

/**
 * 1단계: 구조 설계를 위한 사용자 프롬프트
 */
export function buildStructurePlanningUserPrompt(params: {
  readonly goalType: PlanGoalType;
  readonly currentLevel: PlanLevel;
  readonly targetDueDate: Date | null;
  readonly specialRequirements: string | null;
  readonly requestedSessionCount: number | null;
  readonly materials: ReadonlyArray<{
    readonly title: string;
    readonly chunkCount: number;
    readonly outline: ReadonlyArray<{
      readonly depth: number;
      readonly path: string;
      readonly title: string;
      readonly summary: string | null;
      readonly keywords: ReadonlyArray<string> | null;
      readonly metadataJson: {
        readonly pageStart?: number;
        readonly pageEnd?: number;
        readonly lineStart?: number;
        readonly lineEnd?: number;
      } | null;
    }>;
  }>;
  readonly totalChunkCount: number;
}): string {
  const dueDateStr = params.targetDueDate
    ? params.targetDueDate.toISOString().slice(0, 10)
    : "지정되지 않음 (학습량에 따라 자유롭게 결정)";
  const today = new Date().toISOString().slice(0, 10);

  const materialsJson = JSON.stringify(
    params.materials.map((mat, idx) => ({
      index: idx,
      title: mat.title,
      chunkCount: mat.chunkCount,
      estimatedMinutes: mat.chunkCount * 5,
      outline: mat.outline.map((n) => ({
        depth: n.depth,
        path: n.path,
        title: n.title,
        summary: n.summary,
        keywords: n.keywords,
        metadata: n.metadataJson,
      })),
    })),
    null,
    2,
  );

  const sessionCountHint = params.requestedSessionCount
    ? `사용자 희망 세션 수: ${params.requestedSessionCount}개`
    : `학습량에 맞춤 (AI가 분량에 맞춰 최적의 세션 수 결정)`;

  const recommendedSessions = Math.max(
    1,
    Math.min(90, Math.ceil(params.totalChunkCount / 2.5)),
  );

  return `## 학습 구조 설계 요청

### 기본 정보
- **학습 목표**: ${GOAL_TYPE_LABELS[params.goalType]}
- **현재 수준**: ${LEVEL_LABELS[params.currentLevel]}
- **오늘 날짜**: ${today}
- **목표 완료일**: ${dueDateStr}
- **${sessionCountHint}**

${
  !params.targetDueDate
    ? `
### 기간 및 분량 가이드 (매우 중요)
- 현재 완료 목표일이 지정되지 않았습니다.
- **기간에 관계없이 제공된 자료의 분량에만 집중**하여 가장 효과적으로 학습할 수 있는 세션 수를 결정하세요.
- 권장 세션 수(${recommendedSessions}개)를 참고하되, AI가 판단하기에 더 효율적인 배분이 있다면 가감하여 결정해도 좋습니다.
`
    : ""
}

### 자료 분량 및 구조 정보 (JSON)
\`\`\`json
${materialsJson}
\`\`\`

- **총 청크 수**: ${params.totalChunkCount}개
- **권장 세션 수**: ${recommendedSessions}개 (청크 2~3개당 1세션 기준)

### 수준별 고려사항
${LEVEL_CONSIDERATIONS[params.currentLevel]}
${params.specialRequirements ? `\n### 특별 요구사항\n${params.specialRequirements}` : ""}

## 요청
위 정보를 바탕으로 최적의 학습 구조를 설계해주세요.`;
}

/**
 * 2단계: 모듈별 세션 일괄 생성을 위한 시스템 프롬프트
 * - 기존: 개별 세션 상세화 → 변경: 모듈 내 모든 세션 일괄 생성
 */
export function buildModulePopulationSystemPrompt(): string {
  return `당신은 학습 모듈 설계 전문가입니다.
제공된 학습 자료 청크들을 바탕으로 모듈 내 여러 세션을 일괄 설계합니다.

## 세션 설계 원칙
- 모듈의 전체 흐름을 고려하여 세션을 순차적으로 구성합니다
- 각 세션은 이전 세션의 내용을 자연스럽게 이어받아야 합니다
- 세션 제목: 구체적이고 동기부여가 되는 표현 (120자 이내)
- 학습 목표: SMART 원칙에 따라 측정 가능하게 (300자 이내)
- 모든 응답은 한국어로 작성

## 시간 배분
- 각 세션 예상 학습 시간은 25~50분 사이로 설정
- 청크 분량에 비례하여 시간 할당

## 청크 할당
- 각 세션에 담당할 청크 범위를 지정하세요 (모듈 내 상대 인덱스, 0부터 시작)
- 청크는 순차적으로 할당되어야 하며, 겹치거나 빠지는 청크가 없어야 합니다

## 응답 형식
반드시 세션 객체의 배열로 응답하세요.`;
}

/**
 * 2단계: 모듈별 세션 일괄 생성을 위한 사용자 프롬프트
 */
export function buildModulePopulationUserPrompt(params: {
  readonly moduleTitle: string;
  readonly moduleDescription: string;
  readonly moduleIndex: number;
  readonly totalModules: number;
  readonly sessionCount: number;
  readonly chunkContents: ReadonlyArray<string>;
  readonly currentLevel: PlanLevel;
}): string {
  const chunksSection = params.chunkContents
    .map((content, idx) => `### 청크 ${idx + 1} (인덱스: ${idx})\n${content}`)
    .join("\n\n");

  return `## 모듈 세션 일괄 생성 요청

### 모듈 정보
- **모듈 제목**: ${params.moduleTitle}
- **모듈 설명**: ${params.moduleDescription}
- **모듈 순서**: ${params.moduleIndex + 1}/${params.totalModules}
- **생성할 세션 수**: ${params.sessionCount}개
- **제공된 청크 수**: ${params.chunkContents.length}개
- **학습자 수준**: ${LEVEL_LABELS[params.currentLevel]}

### 학습 자료 내용
${chunksSection}

## 요청
위 내용을 바탕으로 정확히 ${params.sessionCount}개의 세션을 설계해주세요.
각 세션은 모듈의 흐름에 맞게 순차적으로 구성되어야 합니다.

**중요**: 
- 청크 인덱스는 0부터 시작하는 모듈 내 상대 인덱스입니다
- 모든 청크가 세션에 할당되어야 합니다
- 청크는 순차적으로 할당하세요 (예: 세션1이 0-2, 세션2가 3-5)`;
}
