interface RoadmapSummaryInput {
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

interface FocusGoalInput {
  title: string;
  description: string | null;
  order: number;
}

interface FocusSubGoalInput {
  title: string;
  description: string | null;
  order: number;
  dueDateLabel: string;
  memo: string | null;
}

interface RoadmapGoalSummary {
  title: string;
  description: string | null;
  order: number;
  subGoals: Array<{
    title: string;
    description: string | null;
    order: number;
    isCompleted: boolean;
  }>;
}

interface DocumentSummary {
  fileName: string;
  originalFileType: string;
}

export interface SubGoalNotePromptInput {
  roadmap: RoadmapSummaryInput;
  focusGoal: FocusGoalInput;
  focusSubGoal: FocusSubGoalInput;
  roadmapGoals: RoadmapGoalSummary[];
  weeklyHours: number;
  totalWeeks: number;
  referencedDocuments: DocumentSummary[];
}

export function generateSubGoalNotePrompt(
  input: SubGoalNotePromptInput,
): string {
  const {
    roadmap,
    focusGoal,
    focusSubGoal,
    roadmapGoals,
    weeklyHours,
    totalWeeks,
    referencedDocuments,
  } = input;

  const goalSummaries = roadmapGoals
    .map((goal) => {
      const subGoals =
        goal.subGoals.length > 0
          ? goal.subGoals
              .map(
                (sg) =>
                  `      - (${sg.isCompleted ? "완료" : "미완료"}) [${sg.order}] ${sg.title}${sg.description ? ` — ${sg.description}` : ""}`,
              )
              .join("\n")
          : "      - (하위 목표 없음)";

      return [
        `  - [${goal.order}] ${goal.title}${goal.description ? ` — ${goal.description}` : ""}`,
        subGoals,
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
당신은 맞춤형 학습 코치를 돕는 시니어 교육 컨설턴트입니다. 아래 정보를 바탕으로 "${focusSubGoal.title}" 세부 목표에 대한 학습 노트를 한국어로 작성하세요.

## 사용자가 생성한 로드맵 요약
- 로드맵 제목: ${roadmap.title}
- 로드맵 설명: ${roadmap.description ?? "설명 없음"}
- 학습 주제: ${roadmap.learningTopic}
- 사용자 수준: ${roadmap.userLevel}
- 주요 목표: ${roadmap.mainGoal}
- 학습 기간: ${totalWeeks}주
- 주당 학습 가능 시간: ${weeklyHours}시간 (하루 약 ${formattedStudyHoursPerDay}시간)
- 선호 스타일: ${roadmap.learningStyle}
- 선호 자료: ${roadmap.preferredResources}
- 추가 요구사항: ${roadmap.additionalRequirements ?? "없음"}

## 세부 목표 맥락
- 상위 목표 [${focusGoal.order}]: ${focusGoal.title}${focusGoal.description ? ` — ${focusGoal.description}` : ""}
- 집중할 세부 목표 [${focusSubGoal.order}]: ${focusSubGoal.title}
- 세부 목표 설명: ${focusSubGoal.description ?? "설명 없음"}
- 완료 희망 시점: ${focusSubGoal.dueDateLabel}
- 작성자가 남긴 메모: ${focusSubGoal.memo ?? "없음"}

## 전체 로드맵 구조 요약
${goalSummaries}

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
