# Plans 시스템

학습 계획의 상태 머신, 비즈니스 규칙, 모듈/세션 구조를 설명합니다.

**API 상세**: [Scalar 문서](/docs)에서 `/api/plans/*` 확인

---

## 개념

| 개념    | 설명                            | 생성 주체 |
| ------- | ------------------------------- | --------- |
| Plan    | 전체 학습 계획                  | AI 생성   |
| Module  | Plan 내 주제별 그룹             | AI 생성   |
| Session | Module 내 학습 단위 (실행 단위) | AI 생성   |

---

## 상태 머신

### Plan 상태

```
ACTIVE ↔ PAUSED
   ↓         ↓
ARCHIVED ←──┘
   ↓
COMPLETED
```

| 상태      | 설명                  | 허용 전이                   |
| --------- | --------------------- | --------------------------- |
| ACTIVE    | 진행 중, 홈 큐에 표시 | PAUSED, ARCHIVED, COMPLETED |
| PAUSED    | 일시 중지             | ACTIVE, ARCHIVED, COMPLETED |
| ARCHIVED  | 보관 (비활성)         | ACTIVE, PAUSED              |
| COMPLETED | 완료                  | (없음)                      |

### Plan 생성 상태 (generationStatus)

AI가 Plan을 생성하는 과정을 추적:

| 상태       | 설명            |
| ---------- | --------------- |
| PENDING    | 생성 대기 중    |
| GENERATING | AI 생성 진행 중 |
| READY      | 생성 완료       |
| FAILED     | 생성 실패       |

### 상태 전이 규칙

```typescript
// 허용된 전이
const ALLOWED_TRANSITIONS = {
  CREATED: ["ACTIVE"],
  ACTIVE: ["PAUSED", "ARCHIVED", "COMPLETED"],
  PAUSED: ["ACTIVE", "ARCHIVED", "COMPLETED"],
  ARCHIVED: ["ACTIVE", "PAUSED"],
  COMPLETED: [],
};

// 서버 검증
if (!ALLOWED_TRANSITIONS[currentStatus].includes(newStatus)) {
  throw new AppError(400, "INVALID_STATUS_TRANSITION");
}
```

---

## 단일 활성화 정책

사용자는 한 번에 하나의 Plan만 ACTIVE 상태로 유지 권장.

### 자동 전환

새 Plan 생성 또는 activate 호출 시:

```
[기존 ACTIVE Plan] ──자동──> [PAUSED]
           ↓
      [새로운 ACTIVE Plan]
```

**근거**: 학습 집중도 유지, 홈 큐 단순화

### 예외

- 사용자 명시적 PAUSED → 다른 Plan ACTIVE: 원래 Plan은 PAUSED 유지
- 강제 COMPLETED: 다른 Plan은 영향 없음

---

## Plan 생성

### 생성 조건

| 조건        | 검증                           | 실패 시 에러                  |
| ----------- | ------------------------------ | ----------------------------- |
| 자료 상태   | 모든 materialIds가 READY 상태  | PLAN_MATERIAL_NOT_READY (400) |
| 자료 개수   | 1~5개                          | PLAN_MATERIAL_LIMIT (400)     |
| 단일 ACTIVE | 기존 ACTIVE Plan → PAUSED 전환 | (자동 처리)                   |

### 생성 과정 (비동기)

1. 자료 분석 결과 조회
2. **비동기**로 AI 학습 계획 생성 요청 (Queue)
3. Plan 생성 (generationStatus: PENDING)
4. 202 응답 반환 (jobId 포함)
5. 클라이언트는 폴링 또는 WebSocket으로 진행 상황 확인
6. 생성 완료 시 generationStatus: READY
7. 사용자가 title/icon/color 수정 가능

---

## 활성화 (Activate)

```
POST /api/plans/{planId}/activate
```

**동작**:

1. Plan 상태 ACTIVE로 변경
2. 기존 ACTIVE Plan이 있으면 PAUSED로 변경
3. 홈 큐에 즉시 반영

**vs PATCH /status**: activate는 단일 활성화 정책 자동 적용

---

## 삭제

```
DELETE /api/plans/{planId}
```

### 삭제 정책

- **Plan**: 소프트 삭제 (deletedAt 설정)
- **Module/Session**: Cascade 삭제
- **Material**: 유지 (다른 Plan에서 참조 가능)

### GC (가비지 컬렉션)

참조되지 않는 Material은 정책에 따라 정리:

- 30일 후 하드 삭제 검토
- 분석 비용 고려

---

## 진행률 계산

```typescript
const progress = {
  completedSessions: sessions.filter((s) => s.status === "COMPLETED").length,
  totalSessions: sessions.length,
  percentage: Math.round((completed / total) * 100),
};
```

### 스케줄링

AI가 생성한 Session에 예정 날짜 부여:

```typescript
sessions.map((s, i) => ({
  ...s,
  scheduledForDate: calculateDate(startDate, i, specialRequirements),
}));
```

- 주말 제외, 특수 요건 반영
- 예정일이 지난 Session은 "오늘"로 승격

---

## 에러 코드

| 코드                    | HTTP | 상황                | 처리             |
| ----------------------- | ---- | ------------------- | ---------------- |
| PLAN_NOT_FOUND          | 404  | Plan 없음           | 404 페이지       |
| PLAN_MATERIAL_NOT_READY | 400  | 자료 중 미분석 존재 | 자료 페이지 안내 |
| PLAN_MATERIAL_LIMIT     | 400  | 자료 5개 초과       | 입력 제한        |

---

## 관련 문서

- [Plan 시스템](../../03-product/features/plan-system.md)
- [Plan 상세 페이지](../../03-product/pages/plan-detail.md)
