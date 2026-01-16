# Observability

## 개요

로깅, 메트릭, 모니터링 연동 기준을 정의합니다.

---

## 로그

### 상관관계 ID

모든 요청에 고유 ID를 부여하여 추적:

```typescript
app.use("*", async (c, next) => {
  const requestId = c.req.header("x-request-id") || crypto.randomUUID();
  c.set("requestId", requestId);
  c.header("x-request-id", requestId);
  await next();
});
```

### 로그 형식

```json
{
  "timestamp": "2025-01-15T10:00:00Z",
  "level": "info",
  "requestId": "abc-123",
  "userId": "user-456",
  "message": "Plan created",
  "planId": "plan-789"
}
```

---

## 핵심 메트릭

### API

| 메트릭                    | 설명           |
| ------------------------- | -------------- |
| `api_request_duration_ms` | 요청 처리 시간 |
| `api_request_count`       | 요청 수        |
| `api_error_count`         | 에러 수        |

### AI/Gemini

| 메트릭                    | 설명           |
| ------------------------- | -------------- |
| `gemini_embedding_tokens` | 임베딩 토큰 수 |
| `gemini_chat_tokens`      | Chat 토큰 수   |
| `gemini_latency_ms`       | 응답 시간      |
| `gemini_error_count`      | 실패 수        |

### RAG

| 메트릭                  | 설명             |
| ----------------------- | ---------------- |
| `rag_search_latency_ms` | 검색 시간        |
| `rag_hit_rate`          | 관련 청크 발견율 |

---

## 연동

### Sentry (에러 추적)

```typescript
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
});
```

### Posthog (분석)

사용자 행동 이벤트:

- session_started
- session_completed
- plan_created

---

## 알림

| 조건              | 채널  |
| ----------------- | ----- |
| 에러율 > 5%       | Slack |
| P99 지연 > 5s     | Slack |
| Gemini 실패 > 10% | Slack |

---

## 관련 문서

- [시스템 아키텍처](../architecture.md)
