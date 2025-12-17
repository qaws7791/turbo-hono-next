# Session Engine

## 개요

세션 진행 상태 머신, 중간 저장/복구, 동시성 방지를 정의합니다.

---

## 상태 머신

### Session (스케줄)

```
SCHEDULED → IN_PROGRESS → COMPLETED
                ↓
            SCHEDULED (중단 시 복귀)
```

### Session Run (실행)

```
RUNNING → COMPLETED
    ↓
  ABANDONED
```

---

## 스텝 전이

```typescript
const SESSION_STEPS = ["LEARN", "CHECK", "PRACTICE", "COMPLETE"];

interface StepState {
  currentStep: number;
  inputs: Record<string, any>;
  completedAt?: string;
}
```

---

## 중간 저장

### 저장 시점

- 스텝 전환 시
- 사용자 입력 감지 시 (debounce 3초)

### 저장 데이터

```typescript
interface ProgressSnapshot {
  stepIndex: number;
  inputs: Record<string, any>;
  timestamp: string;
}
```

---

## 복구

### 조건

1. RUNNING 상태 Run 존재
2. 마지막 활동 24시간 이내

### 로직

```typescript
async function getOrCreateRun(sessionId: string, userId: string) {
  const existing = await findRunningRun(sessionId, userId);
  if (existing) return { run: existing, isRecovery: true };

  return { run: await createRun(sessionId, userId), isRecovery: false };
}
```

---

## 동시성 방지

### DB 레벨

```sql
CREATE UNIQUE INDEX idx_running_run_per_session
ON session_runs (session_id)
WHERE status = 'RUNNING';
```

### 애플리케이션 레벨

Idempotency-Key로 중복 생성 방지

---

## 관련 문서

- [Sessions API](../api/sessions.md)
- [ADR: Session Run Model](../adr/0003-session-run-model.md)
