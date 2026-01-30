# Chat 시스템

RAG 기반 AI 대화의 스코프 규칙, Citation 구조, 컨텍스트 관리를 설명합니다.

**API 상세**: [Scalar 문서](/docs)에서 `/api/chat/*` 확인

---

## 개요

RAG (Retrieval-Augmented Generation) 방식으로 학습 자료 기반 답변 생성.

```
[사용자 질문] → [문서 검색] → [컨텍스트 주입] → [AI 응답] → [Citation 표시]
```

---

## 스코프 규칙

Thread는 특정 범위(scope)에 바인딩됨:

| 스코프  | ID        | 검색 대상           | 용도              |
| ------- | --------- | ------------------- | ----------------- |
| SESSION | sessionId | 해당 세션 관련 자료 | 세션 진행 중 질문 |
| PLAN    | planId    | Plan 전체 자료      | 계획 수준 질문    |

### 스코프 선택 근거

- **SESSION**: 세션 내용에 집중, 관련 자료만 검색
- **PLAN**: 전체 학습 맥락, 크로스 참조 가능

---

## Thread 생명주기

```
생성 → 메시지 추가 → ... → (자동 보관)
```

| 작업   | 설명                       |
| ------ | -------------------------- |
| 생성   | scopeType + scopeId로 생성 |
| 메시지 | 사용자/AI 메시지 추가      |
| 조회   | Thread 내 메시지 목록      |
| 보관   | 일정 기간 후 자동 정리     |

---

## Citation (인용)

AI 응답의 출처를 표시하는 구조:

```typescript
interface Citation {
  chunkId: string; // 청크 ID
  materialTitle: string; // 자료 제목
  quote: string; // 1~2문장 발췌
  pageRange?: string; // "p.12-13" (PDF)
}
```

### Citation 생성 과정

1. RAG 검색으로 관련 청크들 조회
2. AI 응답 생성 시 출처 청크 참조
3. 응답에 `citations` 배열 포함
4. 클라이언트에서 하이라이트/툴팁 표시

### UI 표시

- 인용 마크 (예: `[1]`)를 답변 텍스트에 삽입
- 하단/사이드에 출처 목록 표시
- 클릭 시 해당 자료 위치로 이동

---

## RAG 검색

### 검색 파이프라인

```
[질문] → [임베딩 생성] → [벡터 검색] → [관련 청크 Top-K] → [재랭킹] → [컨텍스트]
```

| 단계     | 설명                      |
| -------- | ------------------------- |
| 임베딩   | 질문을 벡터로 변환        |
| 검색     | 유사도 기반 청크 검색     |
| 필터링   | 스코프에 맞는 청크만 선택 |
| 재랭킹   | 관련도 순 정렬            |
| 컨텍스트 | AI에 전달할 컨텍스트 구성 |

### No Context 응답

관련 문서 없을 시 정상 응답 (200):

```json
{
  "data": {
    "contentMd": "죄송합니다. 관련 자료에서 답을 찾을 수 없습니다.",
    "citations": [],
    "code": "RAG_NO_CONTEXT"
  }
}
```

---

## Rate Limiting

| 상황               | 처리                  |
| ------------------ | --------------------- |
| AI 서비스 불가     | 503, 재시도 권장      |
| 호출 한도 초과     | 429, retryAfter 헤더  |
| 컨텍스트 크기 초과 | 400, 메시지 정리 요청 |

---

## 관련 문서

- [RAG Retrieval](../backend/rag-retrieval.md)
- [ADR: RAG Scope](../adr/0004-rag-scope-and-citations.md)
