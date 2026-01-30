# Session Engine

## 개요

학습 세션 진행 상태 관리, 중단/복구, 동시성 방지를 담당하는 **학습 실행 엔진**.

## 설계 결정

### 1. Session vs SessionRun 분리

**결정**: 계획된 세션(Session)과 실제 실행(Run)을 분리

```
Session (Plan의 일정 단위)
├── scheduledForDate: 계획된 날짜
├── status: SCHEDULED | IN_PROGRESS | COMPLETED | SKIPPED | CANCELED
└── Runs (실제 실행 기록)
    ├── RUNNING (현재 진행중)
    ├── COMPLETED (완료됨)
    └── ABANDONED (중단됨)
```

**근거**:

- **Recovery**: 중단 후 재시작 시 새 Run 생성, 이전 기록 보존
- **Retry**: 같은 Session을 여러 번 시도 가능
- **Audit**: 실행 이력 추적
- **Flexibility**: 예정일과 실제 실행일 차이 허용

### 2. Create-or-Recover Pattern

**결정**: 세션 시작 시 기존 Run 복구 또는 새 Run 생성

**복구 조건**:

```
1. 동일 Session에 RUNNING 상태 Run 존재
2. 마지막 활동 24시간 이내
```

**근거**:

- **UX**: 페이지 새로고침/재접속 시 진행상황 유지
- **Idempotency**: Idempotency-Key로 중복 생성 방지
- **Atomicity**: DB 유니크 인덱스로 동시성 방지

### 3. State Machine Design

### Session 상태

```
SCHEDULED ──▶ IN_PROGRESS ──▶ COMPLETED
                │
                └──▶ (중단 시) ──▶ SCHEDULED (복귀)
                │
                └──▶ SKIPPED/CANCELED (사용자 액션)
```

### SessionRun 상태

```
RUNNING ──▶ COMPLETED
    │
    └──▶ ABANDONED (24시간 미접속 등)
```

**근거**:

- **Clarity**: 명확한 상태 전이로 비즈니스 로직 단순화
- **Validation**: 잘못된 상태 전이 방지
- **Reporting**: 상태 기반 진행률 계산

## 동시성 제어

### DB 레벨 제어

**Unique Index**: 동일 Session에 RUNNING 상태 Run 1개만 허용

```sql
CREATE UNIQUE INDEX idx_running_run_per_session
ON session_runs (session_id)
WHERE status = 'RUNNING';
```

**근거**:

- **Race condition**: 애플리케이션 레벨 경쟁 상태 방지
- **Atomicity**: DB 수준 atomic guarantee
- **Simplicity**: 애플리케이션 로직 단순화

### 애플리케이션 레벨 제어

**Idempotency-Key**: 클라이언트 생성 키로 중복 요청 방지

```
첫 요청: Idempotency-Key: abc-123
         → 201 Created (Run 생성)

재요청: Idempotency-Key: abc-123 (동일)
        → 201 Created (기존 Run 반환)
```

**근거**:

- **Network retry**: 클라이언트 재시도 시 중복 생성 방지
- **User double-click**: 빠른 중복 클릭 방지
- **Distributed systems**: 서버 간 동기화 없이 idempotency 보장

## Blueprint 기반 진행

### Session Blueprint

**정의**: 세션별 학습 단계(Step)와 흐름을 정의한 템플릿

```
Session
├── blueprint (JSON)
│   ├── steps: [LEARN, CHECK, PRACTICE, COMPLETE]
│   ├── learningContent: 청크 기반 콘텐츠
│   ├── checkQuestions: 이해도 확인 문제
│   ├── practiceActivity: 실습/활동
│   └── encouragement: 격려 메시지
```

**근거**:

- **Consistency**: 동일 Session은 동일 흐름 보장
- **AI-generated**: Plan 생성 시 AI가 설계한 학습 흐름
- **Caching**: blueprint 캐싱으로 반복 조회 비용 절감

### Step Progression

**정책**: Step은 선형 진행 (되돌아가기 없음)

```
Step 0 (LEARN) → Step 1 (CHECK) → Step 2 (PRACTICE) → Step 3 (COMPLETE)
```

**Snapshot 저장**:

- 각 Step 완료 시 진행상황 저장
- 복구 시 마지막 Step부터 재개

## 보이지 않는 규칙

1. **Never allow multiple RUNNING runs**: DB + 앱 레벨 양중 잠금
2. **Always validate session status**: COMPLETED/취소 세션 시작 금지
3. **Always save snapshot**: Step 완료 시 즉시 저장
4. **Never delete runs**: ABANDONED도 기록 보존 (audit)
5. **Always check ownership**: userId 일치 확인

## 에러 시나리오

| 상황                  | 에러 코드                       | 처리            |
| --------------------- | ------------------------------- | --------------- |
| 이미 완료된 세션 시작 | `SESSION_ALREADY_COMPLETED`     | 409 Conflict    |
| 취소/건너뜀 세션 시작 | `INVALID_REQUEST`               | 400 Bad Request |
| 동시 Run 생성 시도    | DB unique violation → 복구 반환 | 200 OK          |
| Idempotency-Key 충돌  | `IDEMPOTENCY_KEY_CONFLICT`      | 409 Conflict    |
| 세션 없음             | `SESSION_NOT_FOUND`             | 404 Not Found   |

## 참고 문서

- [packages/core/modules/session](../../../packages/core/src/modules/session/) - Session 모듈
- [Plan Generation](./plan-generation.md) - blueprint 생성
