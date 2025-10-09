export interface RoadmapPromptData {
  learningTopic: string;
  userLevel: string;
  targetWeeks: number;
  weeklyHours: number;
  learningStyle: string;
  preferredResources: string;
  mainGoal: string;
  additionalRequirements?: string;
  includePdfContents?: boolean;
}

export function generateRoadmapPrompt(data: RoadmapPromptData): string {
  const {
    learningTopic,
    userLevel,
    targetWeeks,
    weeklyHours,
    learningStyle,
    preferredResources,
    mainGoal,
    additionalRequirements,
    includePdfContents,
  } = data;

  return `사용자의 개인화된 학습 로드맵을 생성해주세요.

${
  includePdfContents
    ? `
사용자가 제공한 학습 문서 내용을 **최우선적으로 참고**하여 로드맵을 구성하세요:
- 문서에서 다루는 주제와 순서를 최대한 반영
- 문서의 목차나 챕터 구조를 활용
- 문서에 없는 중요한 내용이 있다면 추가 가능
- 문서의 난이도와 범위를 고려하여 학습 기간 배분

`
    : ""
}
사용자 정보:
- 학습 주제: ${learningTopic}
- 현재 수준: ${userLevel}
- 목표 기간: ${targetWeeks}주
- 주당 학습 시간: ${weeklyHours}시간
- 학습 스타일: ${learningStyle}
- 선호 자료: ${preferredResources}
- 주요 목표: ${mainGoal}
${additionalRequirements ? `- 추가 요구사항: ${additionalRequirements}` : ""}

다음 조건을 고려하여 체계적인 로드맵을 생성해주세요:
1. 사용자의 현재 수준에 맞는 난이도로 시작
2. ${targetWeeks}주 기간에 맞춰 적절히 분배
3. 주당 ${weeklyHours}시간 학습 분량 고려
4. ${learningStyle} 방식에 적합한 학습 방법 제시
5. ${preferredResources} 형태의 자료 중심으로 구성

로드맵 구성:
- 제목: "${learningTopic}" 관련 매력적인 제목
- 설명: 로드맵의 전체적인 개요와 목적
- 3-6개의 주요 목표 (Goal)
- 각 목표당 3-8개의 하위 목표 (SubGoal)

각 목표와 하위 목표는 구체적이고 실행 가능하며, 순서대로 진행할 수 있도록 구성해주세요.`;
}
