# Prompt & Templates

## 개요

프롬프트 템플릿 버전 관리, 구성, 변경 시 회귀 방지 전략을 정의합니다.

---

## 템플릿 구조

```
packages/ai/prompts/
├── system/
│   ├── chat.ts
│   └── plan-generation.ts
├── versions/
│   └── v1/
└── index.ts
```

---

## 시스템 프롬프트

### Chat (RAG)

```typescript
export const chatSystemPrompt = `
당신은 학습 도우미입니다.
제공된 문서 내용만을 기반으로 답변하세요.

규칙:
1. 문서에 없는 내용은 "제공된 자료에서는 찾을 수 없습니다"
2. 추측하지 마세요
3. 간결하고 명확하게 답변하세요
`;
```

---

## 버전 관리

### 버전 태그

```typescript
export const PROMPT_VERSIONS = {
  chat: "v1.2.0",
  planGeneration: "v1.0.0",
};
```

### 변경 기록

| 버전   | 날짜    | 변경 내용          |
| ------ | ------- | ------------------ |
| v1.2.0 | 2025-01 | Citation 강화      |
| v1.1.0 | 2025-01 | Hallucination 방지 |
| v1.0.0 | 2025-01 | 초기 버전          |

---

## 회귀 방지

### 골든 테스트

```typescript
describe("Chat Prompt", () => {
  it("should refuse out-of-context questions", async () => {
    const response = await chat({
      context: "React Hooks 문서",
      question: "날씨가 어때?",
    });

    expect(response).toContain("찾을 수 없습니다");
  });
});
```

### 평가 파이프라인

프롬프트 변경 시:

1. 골든 테스트 실행
2. 샘플 질문 셋으로 품질 비교
3. A/B 테스트 (선택)

---

## 관련 문서

- [RAG Retrieval](./rag-retrieval.md)
- [Chat API](../api/chat.md)
