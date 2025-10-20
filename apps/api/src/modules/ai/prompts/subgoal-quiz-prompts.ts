import type {
  DocumentSummary,
  FocusGoalInput,
  FocusSubGoalInput,
  RoadmapGoalSummary,
  RoadmapSummaryInput,
} from "./subgoal-note-prompts";

export interface SubGoalQuizPromptInput {
  roadmap: RoadmapSummaryInput;
  focusGoal: FocusGoalInput;
  focusSubGoal: FocusSubInput;
  roadmapGoals: RoadmapGoalSummary[];
  referencedDocuments: DocumentSummary[];
  noteMarkdown: string | null;
  targetQuestionCount: number;
  minQuestions: number;
  maxQuestions: number;
  contentWordCount: number;
  contextHighlights: string[];
}

interface FocusSubInput extends FocusSubGoalInput {
  summary: string | null;
}

function formatRoadmapGoals(goals: RoadmapGoalSummary[]): string {
  if (!goals.length) {
    return "- (로드맵에 정의된 목표가 없습니다)";
  }

  return goals
    .map((goal) => {
      const subGoalsText = goal.subGoals.length
        ? goal.subGoals
            .map(
              (subGoal) =>
                `      - (${subGoal.isCompleted ? "완료" : "미완료"}) [${subGoal.order}] ${subGoal.title}${subGoal.description ? ` — ${subGoal.description}` : ""}`,
            )
            .join("\n")
        : "      - (하위 목표 없음)";

      return [
        `  - [${goal.order}] ${goal.title}${goal.description ? ` — ${goal.description}` : ""}`,
        subGoalsText,
      ].join("\n");
    })
    .join("\n");
}

function formatDocuments(documents: DocumentSummary[]): string {
  if (!documents.length) {
    return "- 등록된 참고 문서 없음";
  }

  return documents
    .map(
      (doc) => `- ${doc.fileName} (${doc.originalFileType.toUpperCase()} 문서)`,
    )
    .join("\n");
}

export function generateSubGoalQuizPrompt(
  input: SubGoalQuizPromptInput,
): string {
  const {
    roadmap,
    focusGoal,
    focusSubGoal,
    roadmapGoals,
    referencedDocuments,
    noteMarkdown,
    targetQuestionCount,
    minQuestions,
    maxQuestions,
    contentWordCount,
    contextHighlights,
  } = input;

  const formattedGoals = formatRoadmapGoals(roadmapGoals);
  const formattedDocuments = formatDocuments(referencedDocuments);

  const recommendedQuestionsLine = `- 추천 문항 수: ${targetQuestionCount}문항 (최소 ${minQuestions}, 최대 ${maxQuestions})`;

  const highlights = contextHighlights.length
    ? contextHighlights.map((item) => `- ${item}`).join("\n")
    : "- 추가로 강조할 콘텍스트 없음";

  const noteSection = noteMarkdown
    ? `
## 학습 노트 요약
${focusSubGoal.summary ?? "요약 정보 없음"}

## 학습 노트 전문
${noteMarkdown}
`
    : `
## 학습 노트
- 아직 AI 학습 노트가 생성되지 않았습니다. 아래 정보만으로 퀴즈를 구성하세요.
`;

  return `
당신은 주니어 개발자를 돕는 시니어 교육 컨설턴트입니다. 아래 정보를 바탕으로 "${focusSubGoal.title}" 세부 목표에 대한 4지선다 객관식 퀴즈를 한국어로 작성하세요.

## 사용자 및 로드맵 정보
- 로드맵 제목: ${roadmap.title}
- 로드맵 설명: ${roadmap.description ?? "설명 없음"}
- 학습 주제: ${roadmap.learningTopic}
- 사용자 수준: ${roadmap.userLevel}
- 주요 목표: ${roadmap.mainGoal}
- 학습 기간: ${roadmap.targetWeeks}주
- 주당 학습 가능 시간: ${roadmap.weeklyHours}시간
- 선호 스타일: ${roadmap.learningStyle}
- 선호 자료: ${roadmap.preferredResources}
- 추가 요구사항: ${roadmap.additionalRequirements ?? "없음"}

## 세부 목표 맥락
- 상위 목표 [${focusGoal.order}]: ${focusGoal.title}${focusGoal.description ? ` — ${focusGoal.description}` : ""}
- 집중할 세부 목표 [${focusSubGoal.order}]: ${focusSubGoal.title}
- 세부 목표 설명: ${focusSubGoal.description ?? "설명 없음"}
- 완료 희망 시점: ${focusSubGoal.dueDateLabel}
- 작성자가 남긴 메모: ${focusSubGoal.memo ?? "없음"}
- 학습 컨텐츠 분량(단어 수 기준): 약 ${contentWordCount} 단어

## 퀴즈 생성 가이드
${recommendedQuestionsLine}
- 분량이 적다면 최소 문항만 생성하고, 분량이 많다면 상한선 내에서 적절히 늘려주세요.
- 모든 문항은 4개의 보기(선택지)를 포함해야 하며, 중복되거나 모호한 보기를 피하세요.
- 정답 인덱스(answerIndex)는 0부터 시작하며, 'answerIndex'에 해당하는 보기와 반드시 일치해야 합니다.
- 각 문항에는 정확하고 핵심을 짚는 해설(explanation)을 제공하세요.
- 학습 목표 달성에 실질적인 도움이 될 수 있도록 실무 예제나 흔히 하는 실수를 포함시키면 좋습니다.
- 서로 다른 개념을 고르게 다루어 균형 잡힌 퀴즈를 구성하세요.
- 난이도를 쉽게/중간/심화로 섞되, 너무 어려운 문제는 피하고 학습자의 현재 수준(주니어 개발자)을 고려하세요.
- 문항 ID는 "q1", "q2" 처럼 유일한 문자열로 부여하세요.

## 로드맵 전체 구조
${formattedGoals}

## 참고 문서
${formattedDocuments}

## 추가로 강조할 콘텍스트
${highlights}

${noteSection}

JSON 형태로 결과를 반환하되, 문제는 \`questions\` 배열에 담고 각 요소는 다음 형식을 유지하세요:
\`\`\`
{
  "id": "q1",
  "prompt": "문제 본문",
  "options": ["선택지 A", "선택지 B", "선택지 C", "선택지 D"],
  "answerIndex": 0,
  "explanation": "정답 해설"
}
\`\`\`

위 지침을 모두 지키면서 ${minQuestions}~${maxQuestions}개의 고품질 객관식 문제를 생성하세요.
`.trim();
}
