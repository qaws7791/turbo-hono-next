/**
 * 학습 자료 요약 생성을 위한 프롬프트 빌더
 */

export function buildSummarizeSystemPrompt(): string {
  return `당신은 학습 자료 분석 전문가입니다.
주어진 학습 자료의 내용을 분석하여 핵심 내용을 파악하고,
사용자가 이 자료가 무엇에 관한 것인지 빠르게 이해할 수 있도록 요약합니다.

## 역할
1. 자료의 주제와 핵심 개념을 파악합니다.
2. 학습자 관점에서 유용한 정보를 추려냅니다.
3. 간결하면서도 정보가 풍부한 요약을 작성합니다.

## 규칙
- 요약은 2-3문장, 최대 300자로 작성합니다.
- 전문 용어가 있다면 간단히 설명을 덧붙입니다.
- 학습자가 이 자료를 통해 무엇을 배울 수 있는지 명확히 합니다.
- 모든 응답은 한국어로 작성합니다.`;
}

export type SummarizeUserPromptParams = {
  readonly title: string;
  readonly content: string;
  readonly mimeType: string | null;
};

export function buildSummarizeUserPrompt(
  params: SummarizeUserPromptParams,
): string {
  const fileTypeLabel = inferFileTypeLabel(params.mimeType);

  return `## 학습 자료 요약 요청

### 자료 정보
- **제목**: ${params.title}
- **파일 형식**: ${fileTypeLabel}

### 자료 내용
\`\`\`
${params.content}
\`\`\`

## 요청
위 학습 자료의 내용을 분석하여 2-3문장(최대 300자)으로 요약해주세요.

요약에 포함되어야 할 내용:
1. 이 자료가 다루는 주제
2. 핵심 개념이나 중요 내용
3. 학습자에게 어떤 도움이 될지

JSON 형식으로 응답해주세요:
\`\`\`json
{
  "summary": "요약 내용"
}
\`\`\`

중요: JSON 외의 텍스트는 포함하지 마세요.`;
}

function inferFileTypeLabel(mimeType: string | null): string {
  if (!mimeType) return "알 수 없음";

  const mimeMap: Record<string, string> = {
    "application/pdf": "PDF 문서",
    "text/plain": "텍스트 파일",
    "text/markdown": "마크다운 문서",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "Word 문서",
    "application/msword": "Word 문서",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      "PowerPoint 프레젠테이션",
    "application/vnd.ms-powerpoint": "PowerPoint 프레젠테이션",
  };

  return mimeMap[mimeType] ?? mimeType;
}
