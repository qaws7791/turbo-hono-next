# Testing Guide

이 문서는 테스트 범위, AI 기능 평가 방식, 테스트 데이터 규칙을 안내합니다.

---

## 테스트 범위

### 단위 테스트 (Unit)

| 대상          | 도구   | 위치        |
| ------------- | ------ | ----------- |
| 비즈니스 로직 | Vitest | `*.test.ts` |
| 유틸리티 함수 | Vitest | `*.test.ts` |
| Zod 스키마    | Vitest | `*.test.ts` |

```bash
pnpm test:unit
```

### 통합 테스트 (Integration)

| 대상           | 도구               | 위치                    |
| -------------- | ------------------ | ----------------------- |
| API 엔드포인트 | Vitest + Supertest | `*.integration.test.ts` |
| DB 쿼리        | Vitest + 테스트 DB | `*.integration.test.ts` |

```bash
pnpm test:integration
```

### E2E 테스트 (선택)

| 대상          | 도구       | 위치            |
| ------------- | ---------- | --------------- |
| 사용자 플로우 | Playwright | `e2e/*.spec.ts` |

```bash
pnpm test:e2e
```

---

## AI 기능 평가

### 회귀 테스트

AI 응답 품질 검증을 위한 골든 테스트:

```typescript
describe("RAG Response", () => {
  it("should answer based on uploaded document", async () => {
    const response = await chat.send({
      planId: testPlan.id,
      message: "useState란?",
    });

    expect(response.content).toContain("상태");
    expect(response.citations).toHaveLength(greaterThan(0));
  });
});
```

### 평가 메트릭

| 메트릭          | 측정 방법             |
| --------------- | --------------------- |
| 정확도          | 예상 답변과 비교      |
| Citation 포함율 | 근거 포함 비율        |
| Hallucination   | 문서에 없는 내용 비율 |

---

## 테스트 데이터

### Fixture 규칙

```typescript
// fixtures/materials.ts
export const testMaterials = {
  readyMaterial: {
    id: "test-material-ready",
    title: "React Hooks Guide",
    processingStatus: "READY",
  },
  processingMaterial: {
    id: "test-material-processing",
    processingStatus: "PROCESSING",
  },
};
```

### 시드 데이터

```bash
# 테스트 DB에 시드 데이터 삽입
pnpm db:seed:test
```

---

## 실행 명령어

```bash
# 전체 테스트
pnpm test

# 단위 테스트만
pnpm test:unit

# 통합 테스트만
pnpm test:integration

# 커버리지
pnpm test:coverage
```

---

## CI 설정

```yaml
# .github/workflows/test.yml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm check-types
      - run: pnpm test
```
