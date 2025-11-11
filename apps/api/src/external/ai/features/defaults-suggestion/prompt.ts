export interface DefaultsSuggestionPromptData {
  learningTopic: string;
  mainGoal: string;
  includePdfContents?: boolean;
}

export function generateDefaultsSuggestionPrompt(
  data: DefaultsSuggestionPromptData,
): string {
  const { learningTopic, mainGoal, includePdfContents } = data;

  return `사용자가 학습 계획을 생성하려고 합니다. 다음 정보를 바탕으로 최적의 학습 설정값을 추천해주세요.

${
  includePdfContents
    ? `
사용자가 제공한 PDF 문서를 분석하여:
- 문서의 난이도 수준을 파악하여 userLevel 추천
- 문서의 분량과 복잡도를 고려하여 targetWeeks와 weeklyHours 추천
- 문서의 특성(이론서, 실습서, 공식문서 등)에 따라 learningStyle과 preferredResources 추천

`
    : ""
}
사용자 입력:
- 학습 주제: ${learningTopic}
- 주요 목표: ${mainGoal}

아래 항목들에 대해 최적의 값을 추천해주세요:

1. **userLevel** (사용자 수준): 다음 중 하나 선택
   - "초보자": 해당 분야를 처음 접하는 사람
   - "기초": 기본 개념은 알지만 실무 경험이 적음
   - "중급": 실무 경험이 있고 중급 수준의 프로젝트 가능
   - "고급": 해당 분야의 숙련자
   - "전문가": 해당 분야의 전문가 수준

   주제와 목표를 보고 사용자의 예상 수준을 추론하세요.

2. **targetWeeks** (목표 기간): 1-24주 사이의 정수
   - 학습 주제의 범위와 깊이를 고려
   - 목표 달성에 필요한 현실적인 기간

3. **weeklyHours** (주당 학습 시간): 1-60시간 사이의 정수
   - 대부분의 학습자는 주당 5-15시간이 적절
   - 목표의 긴급성을 고려

4. **learningStyle** (학습 스타일): 다음 중 하나 선택
   - "시각적 학습": 다이어그램, 차트, 비디오 선호
   - "실습 중심": 코딩, 실험, 프로젝트 중심 학습
   - "문서 읽기": 책, 아티클, 논문 읽기 선호
   - "동영상 강의": 강의 영상을 통한 학습
   - "대화형 학습": 토론, 멘토링, 질의응답 중심
   - "프로젝트 기반": 실제 프로젝트를 만들며 학습

   주제 특성에 가장 효과적인 학습 스타일을 선택하세요.

5. **preferredResources** (선호 학습 자료): 다음 중 하나 선택
   - "온라인 강의": Udemy, Coursera 등의 체계적인 강의
   - "책/전자책": 깊이 있는 이론 학습
   - "튜토리얼": 단계별 가이드, 실습 중심 자료
   - "유튜브 영상": 무료 동영상 강의
   - "공식 문서": 기술 공식 문서, API 문서
   - "실습 사이트": Codecademy, LeetCode 등 실습 플랫폼

   주제와 학습 스타일에 가장 적합한 자료 유형을 선택하세요.

6. **reasoning** (추천 이유): 왜 이런 값들을 추천했는지 1-2문장으로 간단히 설명

주제의 특성을 고려한 예시:
- "React 프론트엔드 개발" + "취업 목표"
  → userLevel: "초보자", targetWeeks: 12, weeklyHours: 15, learningStyle: "실습 중심", preferredResources: "온라인 강의"

- "Python 데이터 분석" + "업무 활용"
  → userLevel: "기초", targetWeeks: 8, weeklyHours: 10, learningStyle: "프로젝트 기반", preferredResources: "튜토리얼"

- "알고리즘 코딩테스트" + "3개월 내 준비"
  → userLevel: "중급", targetWeeks: 12, weeklyHours: 12, learningStyle: "실습 중심", preferredResources: "실습 사이트"

응답은 반드시 JSON 형식으로 제공하고, 다음 키를 모두 포함해야 합니다:
{
  "userLevel": string,
  "targetWeeks": number,
  "weeklyHours": number,
  "learningStyle": string,
  "preferredResources": string,
  "reasoning": string
}`;
}
