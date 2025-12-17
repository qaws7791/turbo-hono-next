# Chat API

## 개요

RAG 기반 AI 대화 API입니다. Plan/Session/Concept 범위에서 문서 기반 답변을 생성합니다.

---

## 엔드포인트

### 메시지 전송

```
POST /api/v1/chat/threads/{threadId}/messages
```

**Request**:

```json
{
  "content": "useState와 useReducer의 차이점은?"
}
```

**Response** (200):

```json
{
  "data": {
    "id": "uuid",
    "role": "ASSISTANT",
    "contentMd": "useState와 useReducer의 주요 차이점은...",
    "citations": [
      {
        "chunkId": "uuid",
        "materialTitle": "React Hooks 가이드",
        "quote": "useState는 단순한 상태에...",
        "pageRange": "p.12-13"
      }
    ]
  }
}
```

### 채팅 스레드 생성

```
POST /api/v1/chat/threads
```

**Request**:

```json
{
  "scopeType": "PLAN",
  "scopeId": "plan-uuid"
}
```

scopeType: SPACE / PLAN / SESSION / CONCEPT

### 스레드 메시지 목록

```
GET /api/v1/chat/threads/{threadId}/messages
```

---

## 스코프 규칙

| Scope   | 검색 범위                       |
| ------- | ------------------------------- |
| PLAN    | Plan의 source_materials         |
| SESSION | 해당 Plan의 source_materials    |
| CONCEPT | Concept 학습에 사용된 materials |
| SPACE   | Space 전체 materials (향후)     |

---

## Citation 응답

```typescript
interface Citation {
  chunkId: string;
  materialTitle: string;
  quote: string; // 1~2문장 발췌
  pageRange?: string; // "p.12-13"
}
```

---

## 에러 코드

| 코드                   | HTTP | 설명                       |
| ---------------------- | ---- | -------------------------- |
| AI_SERVICE_UNAVAILABLE | 503  | AI 서비스 불가             |
| AI_RATE_LIMIT          | 429  | 호출 한도 초과             |
| RAG_NO_CONTEXT         | 200  | 관련 문서 없음 (정상 응답) |

---

## 관련 문서

- [RAG Retrieval](../backend/rag-retrieval.md)
- [ADR: RAG Scope](../adr/0004-rag-scope-and-citations.md)
