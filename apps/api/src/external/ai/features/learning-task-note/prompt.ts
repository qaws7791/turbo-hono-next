export interface LearningPlanSummaryInput {
  title: string;
  description: string | null;
  learningTopic: string;
  userLevel: string;
  targetWeeks: number;
  weeklyHours: number;
  learningStyle: string;
  preferredResources: string;
  mainGoal: string;
  additionalRequirements: string | null;
}

export interface FocusLearningModuleInput {
  title: string;
  description: string | null;
  order: number;
}

export interface FocusLearningTaskInput {
  title: string;
  description: string | null;
  order: number;
  dueDateLabel: string;
  memo: string | null;
}

export interface LearningPlanLearningModuleSummary {
  title: string;
  description: string | null;
  order: number;
  learningTasks: Array<{
    title: string;
    description: string | null;
    order: number;
    isCompleted: boolean;
  }>;
}

export interface DocumentSummary {
  fileName: string;
  originalFileType: string;
}

export interface LearningTaskNotePromptInput {
  learningPlan: LearningPlanSummaryInput;
  focusLearningModule: FocusLearningModuleInput;
  focusLearningTask: FocusLearningTaskInput;
  learningPlanLearningModules: Array<LearningPlanLearningModuleSummary>;
  weeklyHours: number;
  totalWeeks: number;
  referencedDocuments: Array<DocumentSummary>;
}

export function generateLearningTaskNotePrompt(
  input: LearningTaskNotePromptInput,
): string {
  const {
    learningPlan,
    focusLearningModule,
    focusLearningTask,
    learningPlanLearningModules,
    weeklyHours,
    totalWeeks,
    referencedDocuments,
  } = input;

  const learningModuleSummaries = learningPlanLearningModules
    .map((learningModule) => {
      const learningTasks =
        learningModule.learningTasks.length > 0
          ? learningModule.learningTasks
              .map(
                (sg) =>
                  `      - (${sg.isCompleted ? "완료" : "미완료"}) [${sg.order}] ${sg.title}${sg.description ? ` — ${sg.description}` : ""}`,
              )
              .join("\n")
          : "      - (하위 목표 없음)";

      return [
        `  - [${learningModule.order}] ${learningModule.title}${learningModule.description ? ` — ${learningModule.description}` : ""}`,
        learningTasks,
      ].join("\n");
    })
    .join("\n");

  const documentSummary = referencedDocuments.length
    ? referencedDocuments
        .map(
          (doc) =>
            `- ${doc.fileName} (${doc.originalFileType.toUpperCase()} 문서)`,
        )
        .join("\n")
    : "- 등록된 참고 문서 없음";

  const studyHoursPerDay = weeklyHours / 7;
  const formattedStudyHoursPerDay = studyHoursPerDay
    .toFixed(1)
    .replace(/\.0$/, "");

  const recommendedSections = [
    "소개",
    "주요 개념",
    "상세 설명",
    "예시와 적용",
    "추가 자료",
  ];

  return `
당신은 맞춤형 학습 코치를 돕는 시니어 교육 컨설턴트입니다. 아래 정보를 바탕으로 "${focusLearningTask.title}" 세부 목표에 대한 학습 노트를 한국어로 작성하세요.

## 사용자가 생성한 학습 계획 요약
- 학습 계획 제목: ${learningPlan.title}
- 학습 계획 설명: ${learningPlan.description ?? "설명 없음"}
- 학습 주제: ${learningPlan.learningTopic}
- 사용자 수준: ${learningPlan.userLevel}
- 주요 목표: ${learningPlan.mainGoal}
- 학습 기간: ${totalWeeks}주
- 주당 학습 가능 시간: ${weeklyHours}시간 (하루 약 ${formattedStudyHoursPerDay}시간)
- 선호 스타일: ${learningPlan.learningStyle}
- 선호 자료: ${learningPlan.preferredResources}
- 추가 요구사항: ${learningPlan.additionalRequirements ?? "없음"}

## 세부 목표 맥락
- 상위 목표 [${focusLearningModule.order}]: ${focusLearningModule.title}${focusLearningModule.description ? ` — ${focusLearningModule.description}` : ""}
- 집중할 세부 목표 [${focusLearningTask.order}]: ${focusLearningTask.title}
- 세부 목표 설명: ${focusLearningTask.description ?? "설명 없음"}
- 완료 희망 시점: ${focusLearningTask.dueDateLabel}
- 작성자가 남긴 메모: ${focusLearningTask.memo ?? "없음"}

## 전체 학습 계획 구조 요약
${learningModuleSummaries}

## 참고 문서
${documentSummary}

## 마크다운 출력 요구사항
1. 마크다운 헤딩을 활용하고, 불릿과 번호 목록을 적절히 섞어 구조적으로 작성하세요.
2. 위 학습 시간(하루 ${formattedStudyHoursPerDay}시간)을 고려하여, 최대 5000자 내외로 적절한 분량의 노트 분량으로 만드세요.
3. ${recommendedSections
    .map((section, index) => `${index + 1}. ${section}`)
    .join("\n")}
   위와 같은 섹션들을 포함하되, 필요 시 소제목을 추가할 수 있습니다.
4. 필요한 경우 코드를 포함할 수 있습니다.

## 어조
- 친근하지만 전문적인 어조를 유지하고, 초점은 실천 가능한 학습 지도에 둡니다.
- 확신할 수 없는 정보는 추측하지 말고, 부족하다면 추가 탐색을 권장하세요.

이 지침을 모두 따르는 고품질의 마크다운 학습 노트를 생성하세요.
`.trim();
}
