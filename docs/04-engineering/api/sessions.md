# Sessions API

## 개요

학습 세션의 조회, 실행, 복구 API입니다.

---

## 엔드포인트

### 오늘 할 일 큐 조회

```
GET /api/home/queue
```

모든 활성(Active) 학습 계획에서 오늘 예정된 세션을 집계합니다.

**Response** (200):

```json
{
  "data": [
    {
      "sessionId": "uuid",
      "planTitle": "React 마스터",
      "moduleTitle": "Module 2: Hooks",
      "sessionTitle": "Session 1: useState",
      "sessionType": "LEARN",
      "estimatedMinutes": 25,
      "status": "SCHEDULED"
    }
  ],
  "summary": { "total": 3, "completed": 1 }
}
```

### Session Run 생성/재개

```
POST /api/sessions/{sessionId}/runs
```

진행 중인 Run이 있으면 해당 Run 반환 (복구)

**Response** (201 또는 200):

```json
{
  "data": {
    "runId": "uuid",
    "sessionId": "uuid",
    "status": "RUNNING",
    "isRecovery": false,
    "currentStep": 0
  }
}
```

### Session Run 진행 저장

```
PATCH /api/session-runs/{runId}/progress
```

**Request**:

```json
{
  "stepIndex": 2,
  "inputs": { "answer": "..." }
}
```

### Session Run 완료

```
POST /api/session-runs/{runId}/complete
```

요약 생성 트리거

**Response** (200):

```json
{
  "data": {
    "runId": "uuid",
    "status": "COMPLETED",
    "summary": { "id": "uuid" }
  }
}
```

### Session Run 중단

```
POST /api/session-runs/{runId}/abandon
```

**Request**: `{ "reason": "USER_EXIT" }`

---

## Idempotency

중복 요청 방지를 위해 `Idempotency-Key` 헤더 사용:

```
POST /api/sessions/{sessionId}/runs
Idempotency-Key: client-generated-uuid
```

---

## 에러 코드

| 코드                      | HTTP | 설명             |
| ------------------------- | ---- | ---------------- |
| SESSION_NOT_FOUND         | 404  | 세션 없음        |
| SESSION_ALREADY_COMPLETED | 400  | 이미 완료        |
| SESSION_RUN_EXISTS        | 409  | 진행 중 Run 존재 |

---

## 관련 문서

- [풀스크린 학습 세션](../../03-product/pages/learning-session.md)
- [Session Engine](../backend/session-engine.md)
