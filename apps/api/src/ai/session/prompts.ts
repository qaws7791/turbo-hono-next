function formatObjective(value: string | null): string {
  const trimmed = value?.trim() ?? "";
  return trimmed.length ? trimmed : "(없음)";
}

export function buildSystemPrompt(): string {
  return `당신은 학습 세션 디자이너 AI입니다.

## 목표
- 주어진 세션 정보와 자료 발췌를 바탕으로, 사용자가 실제로 따라할 수 있는 "학습 세션 스텝(블루프린트)"을 작성합니다.

## 규칙
- 응답은 반드시 JSON 객체 1개만 반환합니다. JSON 외 텍스트를 포함하지 마세요.
- 모든 텍스트는 한국어로 작성합니다.
- 제공된 템플릿 JSON의 steps[].id 와 steps[].type, 그리고 schemaVersion/createdAt/startStepIndex는 그대로 유지합니다.
- 선택지형 스텝(CHECK/CLOZE/APPLICATION)은 정답 인덱스(answerIndex/correctIndex)가 실제 정답을 가리키도록 맞춥니다.`;
}

export function buildUserPrompt(params: {
  readonly sessionType: "LEARN";
  readonly planTitle: string;
  readonly moduleTitle: string;
  readonly sessionTitle: string;
  readonly objective: string | null;
  readonly estimatedMinutes: number;
  readonly template: unknown;
}): string {
  const templateJson = JSON.stringify(params.template, null, 2);

  return `## 세션 정보
- sessionType: ${params.sessionType}
- planTitle: ${params.planTitle}
- moduleTitle: ${params.moduleTitle}
- sessionTitle: ${params.sessionTitle}
- objective: ${formatObjective(params.objective)}
- estimatedMinutes: ${params.estimatedMinutes}

## 템플릿(JSON)
\`\`\`json
${templateJson}
\`\`\`

## 요청
위 템플릿을 기반으로 다음을 수행하세요.
- steps 내 텍스트(learningGoals/questionsToCover/content/question/options/explanation/scenario/feedback/encouragement/keyTakeaways/nextSessionPreview 등)를 세션 정보에 맞게 구체화합니다.
- 템플릿에 이미 포함된 자료 발췌가 있다면, 그 내용을 우선하여 설명/문항/예시를 구성합니다.
- 개념 이해→확인→적용 흐름으로 구성합니다.

중요: 반드시 JSON만 반환하세요.`;
}
