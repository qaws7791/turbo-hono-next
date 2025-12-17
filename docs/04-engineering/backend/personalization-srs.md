# Personalization & SRS

## 개요

Spaced Repetition System (SM-2 기반) 알고리즘, 복습 세션 편성 로직을 정의합니다.

---

## SM-2 알고리즘

### 파라미터

| 파라미터         | 기본값 | 설명             |
| ---------------- | ------ | ---------------- |
| Initial Interval | 1일    | 첫 복습 간격     |
| Initial Ease     | 2.5    | 초기 난이도 계수 |
| Min Ease         | 1.3    | 최소 난이도 계수 |

### Rating → Interval 규칙

```typescript
function calculateNextReview(prev: SRSState, rating: Rating): SRSState {
  const { interval, ease } = prev;

  switch (rating) {
    case "AGAIN":
      return { interval: 1, ease: Math.max(1.3, ease - 0.2) };
    case "HARD":
      return { interval: Math.round(interval * 1.2), ease: ease - 0.15 };
    case "GOOD":
      return { interval: Math.round(interval * ease), ease };
    case "EASY":
      return { interval: Math.round(interval * ease * 1.3), ease: ease + 0.15 };
  }
}
```

### due_at 계산

```typescript
const nextDueAt = dayjs().add(newInterval, "day").startOf("day").toDate();
```

---

## 복습 세션 편성

### 복습 대상 선정

```typescript
async function getDueReviews(userId: string, date: Date) {
  return db
    .select()
    .from(concepts)
    .where(and(eq(concepts.userId, userId), lte(concepts.srsDueAt, date)))
    .orderBy(asc(concepts.srsDueAt))
    .limit(10);
}
```

### 복습 세션 생성

Plan 생성 시 자동으로 복습 세션 배치:

1. 학습 세션 완료 1일 후: 첫 복습
2. 이후: SRS 간격에 따라 동적 배치

---

## 복습 상태

| 상태    | 조건                      | 색상 |
| ------- | ------------------------- | ---- |
| GOOD    | dueAt > today + 3         | 🟢   |
| DUE     | today ≤ dueAt ≤ today + 3 | 🟡   |
| OVERDUE | dueAt < today             | 🔴   |

---

## 관련 문서

- [Concepts API](../api/concepts.md)
- [Concept Library](../../03-product/pages/concept-library.md)
