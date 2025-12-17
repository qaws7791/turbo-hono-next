# ADR 0004: RAG 스코프 및 Citation 규칙

## 상태

**확정** (2025-12)

---

## 컨텍스트

Learning OS의 AI 기능은 사용자가 업로드한 문서를 기반으로 답변을 생성합니다(RAG). 다음 결정이 필요합니다:

1. 어떤 범위의 문서를 검색할 것인가?
2. 답변에 출처(Citation)를 표시할 것인가?
3. 답변의 재현성을 어떻게 보장할 것인가?

---

## 결정

### 검색 스코프

**Plan 범위 제한**을 기본으로 합니다.

| 컨텍스트          | 검색 스코프                           |
| ----------------- | ------------------------------------- |
| Session 학습/복습 | Plan의 source_materials               |
| Plan 내 Chat      | Plan의 source_materials               |
| Concept 복습      | 해당 Concept 학습 시 사용된 materials |

### Citation

**MVP에서는 선택 사항**으로 두되, 인프라는 준비합니다.

---

## 상세 설계

### 스코프 제한 구현

```typescript
async function ragSearch(params: {
  query: string;
  scopeType: "PLAN" | "SESSION" | "CONCEPT";
  scopeId: string;
}) {
  let materialIds: string[];

  switch (params.scopeType) {
    case "PLAN":
      materialIds = await getPlanMaterialIds(params.scopeId);
      break;
    case "SESSION":
      const session = await getSession(params.scopeId);
      materialIds = await getPlanMaterialIds(session.planId);
      break;
    case "CONCEPT":
      materialIds = await getConceptSourceMaterials(params.scopeId);
      break;
  }

  return vectorStore.similaritySearch(params.query, {
    filter: { materialId: { $in: materialIds } },
    k: 5,
  });
}
```

### Citation 저장

```sql
CREATE TABLE chat_citations (
  id          UUID PRIMARY KEY,
  message_id  UUID REFERENCES chat_messages(id),
  chunk_id    UUID REFERENCES material_chunks(id),
  score       NUMERIC,        -- 관련도 점수
  quote       TEXT,           -- 발췌 (1~2문장)
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### Citation 응답 포맷

```typescript
interface ChatResponse {
  content: string;
  citations?: {
    chunkId: string;
    materialTitle: string;
    quote: string;
    pageRange?: string;
  }[];
}
```

---

## 근거

### 스코프 제한 채택 이유

1. **관련성**
   - 현재 학습 맥락에 맞는 답변만 제공
   - 다른 Space/Plan의 문서가 혼입되면 혼란

2. **Hallucination 방지**
   - 근거가 제한되면 LLM의 "지어내기" 가능성 감소
   - "문서에 없는 내용이면 모른다고 답변" 프롬프트 적용

3. **성능**
   - 검색 대상이 적을수록 응답 속도 향상
   - 벡터 인덱스 효율성 증가

### Citation 선택 사항인 이유

1. **MVP 단순화**
   - Citation UI 개발 비용
   - 사용자에게 과도한 정보가 될 수 있음

2. **향후 확장 대비**
   - 데이터 저장 인프라는 준비
   - 신뢰성 요구 증가 시 활성화

---

## 재현성 전략

### 문제

동일한 질문에 동일한 답변을 보장할 수 있는가?

### 전략

1. **청크 버전 관리 (선택)**
   - 문서 재인덱싱 시 청크 버전 증가
   - 기존 Plan은 이전 버전 청크 사용

2. **검색 결과 로깅**
   - chat_messages에 사용된 chunk_ids 저장
   - 디버깅/재현 가능

3. **Temperature 고정**
   - 일관된 응답을 위해 낮은 temperature 사용

```typescript
const llmConfig = {
  model: "gpt-4o-mini",
  temperature: 0.3, // 낮은 창의성, 높은 일관성
};
```

---

## 구현 지침

### 프롬프트 템플릿

```typescript
const systemPrompt = `
당신은 학습 도우미입니다. 
사용자의 질문에 제공된 문서 내용만을 기반으로 답변하세요.

규칙:
1. 문서에 없는 내용은 "제공된 자료에서는 해당 내용을 찾을 수 없습니다"라고 답변
2. 추측이나 외부 지식을 사용하지 마세요
3. 답변 시 근거가 되는 부분을 참조할 수 있다면 언급하세요

제공된 문서 내용:
{context}
`;
```

### 검색 → 생성 파이프라인

```typescript
async function generateAnswer(planId: string, question: string) {
  // 1. 관련 청크 검색
  const chunks = await ragSearch({
    query: question,
    scopeType: "PLAN",
    scopeId: planId,
  });

  // 2. 컨텍스트 구성
  const context = chunks
    .map((c) => `[${c.materialTitle}]\n${c.content}`)
    .join("\n\n---\n\n");

  // 3. LLM 호출
  const response = await llm.invoke([
    { role: "system", content: systemPrompt.replace("{context}", context) },
    { role: "user", content: question },
  ]);

  // 4. Citation 저장 (선택)
  if (config.enableCitations) {
    await saveCitations(response.messageId, chunks);
  }

  return response;
}
```

---

## 결과

### 긍정적

- 답변 품질 및 관련성 향상
- Hallucination 감소
- 성능 최적화

### 부정적

- 범위 외 질문에 답변 불가
- Citation 개발 보류

---

## 향후 확장

1. **Space 범위 검색**: Plan 외 전체 Space 문서 검색 옵션
2. **Citation UI**: 클릭 시 원본 문서 해당 위치로 이동
3. **하이브리드 검색**: 키워드 + 벡터 결합

---

## 관련 문서

- [시스템 아키텍처](../architecture.md)
- [RAG Retrieval](../backend/rag-retrieval.md)
- [Chat API](../api/chat.md)
