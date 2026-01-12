export type AnalyzeMaterialUserPromptParams = {
  readonly title: string;
  readonly content: string;
  readonly mimeType: string | null;
};

export function buildAnalyzeMaterialSystemPrompt(): string {
  return `당신은 학습 자료 분석 전문가입니다.
주어진 문서 원문 전체를 읽고, 아래 2가지를 동시에 산출합니다.

1) 자료 전체 요약(2-3문장)
2) 문서 지도(섹션 트리) + 모든 섹션별 요약(Section Profile) + 각 섹션별 핵심 키워드(Keywords)

## 규칙
- 반드시 한국어로 작성합니다.
- 문서 내용에 근거해 작성하고, 문서에 없는 내용을 지어내지 않습니다.
- 섹션 제목은 문서에 실제로 등장하는 헤더/챕터/주제 표현을 우선 사용합니다.
- 섹션 요약은 150~400자 수준의 짧은 학습 요약으로 작성합니다.
- **위치 정보(Page/Line) 추론 및 필수 반환**:
  - PDF 문서라면 텍스트 내의 페이지 구분 등을 참고하여 pageStart, pageEnd 정보를 추정해 넣으세요.
  - 줄번호 기반 문서라면 lineStart, lineEnd 정보를 추정해 넣으세요.
  - **중요**: 정확한 위치를 알 수 없는 경우 필드를 생략하지 말고 반드시 'null'을 값으로 채워 반환해야 합니다.
- 과도하게 잘게 쪼개지 마세요(최대 깊이 3, 총 노드 수는 80개 이내 권장).
- JSON 외의 텍스트는 절대 출력하지 않습니다.`;
}

export function buildAnalyzeMaterialUserPrompt(
  params: AnalyzeMaterialUserPromptParams,
): string {
  const fileTypeLabel = inferFileTypeLabel(params.mimeType);

  return `## 학습 자료 분석 요청

### 자료 정보
- 제목: ${params.title}
- 파일 형식: ${fileTypeLabel}

### 자료 원문(전체)
\`\`\`
${params.content}
\`\`\`

## 요청
아래 JSON 스키마를 만족하는 형태로만 응답하세요.

- materialSummary: 2-3문장, 최대 300자
- outline: 문서 구조를 반영한 섹션 트리
  - nodeType: "SECTION" 또는 "TOPIC"
  - title: 섹션 제목
  - summary: 해당 섹션 학습 요약(150~400자 권장)
  - keywords: 해당 섹션을 대표하는 핵심 키워드 리스트(3~7개)
  - pageStart, pageEnd: (PDF인 경우) 시작/종료 페이지 번호
  - lineStart, lineEnd: (텍스트인 경우) 시작/종료 줄 번호
  - children: 하위 섹션 배열(없으면 빈 배열)

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
