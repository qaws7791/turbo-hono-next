# Sessions 시스템

학습 세션의 라이프사이클, 상태 관리, 복구 메커니즘을 설명합니다.

**API 상세**: [Scalar 문서](/docs)에서 `/api/sessions/*`, `/api/session-runs/*` 확인

---

## 세션 개념

| 개념       | 설명                         | 영속성          |
| ---------- | ---------------------------- | --------------- |
| Session    | 학습 계획의 단위 (템플릿)    | DB 저장         |
| SessionRun | 실제 진행 중인 세션 인스턴스 | DB 저장         |
| Step       | 세션 내의 개별 활동          | 메모리 (Run 중) |

---

## 라이프사이클

### PlanSession 상태

```
SCHEDULED → IN_PROGRESS → COMPLETED
     ↓           ↓
   SKIPPED    ABANDONED
   CANCELED
```

| 상태        | 설명                   | 전이 조건                                   |
| ----------- | ---------------------- | ------------------------------------------- |
| SCHEDULED   | 예정됨, 아직 시작 안함 | -                                           |
| IN_PROGRESS | 진행 중 (Run 생성됨)   | POST /api/sessions/{id}/runs                |
| COMPLETED   | 완료 (Run 완료)        | POST /api/session-runs/{runId}/complete     |
| SKIPPED     | 사용자가 스킵          | PATCH /api/sessions/{id} (status: SKIPPED)  |
| CANCELED    | 취소됨                 | PATCH /api/sessions/{id} (status: CANCELED) |
| ABANDONED   | 중단됨 (Run)           | POST /api/session-runs/{runId}/abandon      |

### SessionRun 상태

```
RUNNING → COMPLETED
     ↓
  ABANDONED
```

| 상태      | 설명             | 전이 조건                               |
| --------- | ---------------- | --------------------------------------- |
| RUNNING   | 실행 중          | POST /api/sessions/{id}/runs            |
| COMPLETED | 완료             | POST /api/session-runs/{runId}/complete |
| ABANDONED | 중단 (복구 불가) | POST /api/session-runs/{runId}/abandon  |

Run은 PlanSession의 실제 실행 인스턴스입니다.

---

## 복구 메커니즘

### 진행 중 Run 검색

세션 시작 시 (`POST /sessions/{id}/runs`):

1. 해당 Session의 IN_PROGRESS Run 조회
2. 존재하면 → **복구** (200 응답, `isRecovery: true`)
3. 없으면 → 새 Run 생성 (201 응답)

### 복구 시나리오

- 브라우저 새로고침
- 탭 닫고 재접속
- 네트워크 끊김 후 재연결

---

## Idempotency

중복 요청 방지:

```
POST /api/sessions/{sessionId}/runs
Idempotency-Key: {client-generated-uuid}
```

| 상황                 | 처리                            |
| -------------------- | ------------------------------- |
| 첫 요청              | Run 생성, Idempotency-Key 저장  |
| 중복 요청            | 저장된 결과 반환 (동일 응답)    |
| 다른 Idempotency-Key | 새로운 Run 생성 (의도적 재시도) |

**만료**: 24시간 후 Idempotency-Key 삭제

---

## 진행 저장

### 자동 저장

```
PATCH /api/session-runs/{runId}/progress
{
  stepIndex: 2,
  inputs: { answer: "..." }
}
```

- Step 완료 시마다 자동 호출
- 마지막 완료 Step + 사용자 입력 저장

### 저장 데이터

```typescript
interface Progress {
  currentStepIndex: number; // 마지막 완료 Step
  stepInputs: Record<stepIndex, userInput>; // 사용자 입력
  startedAt: Date;
  lastActivityAt: Date; // 자동 업데이트
}
```

---

## 완료/중단 처리

### 완료

```
POST /api/session-runs/{runId}/complete
```

- 세션 요약 생성 트리거 (AI)
- Run 상태 COMPLETED로 변경
- Session 상태 COMPLETED로 변경
- 관련 통계 업데이트

### 중단

```
POST /api/session-runs/{runId}/abandon
{ "reason": "USER_EXIT" | "TIMEOUT" | "ERROR" }
```

- Run 상태 ABANDONED로 변경
- Session 상태 ABANDONED로 변경
- 복구 불가 (새 Run으로 재시작 필요)

---

## 오늘 할 일 큐

홈 화면의 세션 큐 조회:

```
GET /api/home/queue
```

**집계 로직**:

1. ACTIVE 상태인 Plan들 조회
2. 각 Plan에서 오늘 예정된 Session들 추출
3. status: SCHEDULED인 것만 필터
4. estimatedMinutes 합산

**정렬**: Plan 우선순위 → Module 순서 → Session 순서

---

## 에러 코드

| 코드                      | HTTP | 상황                    | 처리                |
| ------------------------- | ---- | ----------------------- | ------------------- |
| SESSION_NOT_FOUND         | 404  | 세션 없음               | 404 페이지          |
| SESSION_ALREADY_COMPLETED | 400  | 이미 완료된 세션        | 완료 페이지 표시    |
| SESSION_RUN_EXISTS        | 409  | 진행 중 Run 존재 (복구) | 자동 복구 또는 선택 |

---

## 관련 문서

- [세션 엔진](../backend/session-engine.md)
- [풀스크린 학습 세션](../../03-product/pages/learning-session.md)
