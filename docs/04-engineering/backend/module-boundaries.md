# 모듈 경계 및 레이어 규칙

## 개요

백엔드 코드의 Route/Service/AI Layer 분리 규칙, 트랜잭션 경계, 공통 미들웨어를 정의합니다.

---

## 레이어 구조

```
apps/api/src/
├── routes/           # L1: Application Layer
│   ├── materials.ts
│   ├── plans.ts
│   └── ...
├── services/         # L2: Business Layer
│   ├── MaterialService.ts
│   ├── PlanService.ts
│   └── ...
├── ai/              # L3: AI Layer
│   ├── ingestion/
│   ├── retrieval/
│   └── generation/
├── middleware/      # Cross-cutting
│   ├── auth.ts
│   ├── rateLimit.ts
│   └── errorHandler.ts
└── lib/             # Utilities
    ├── db.ts
    └── r2.ts
```

---

## 레이어 규칙

### Routes (얇게 유지)

```typescript
// ✅ Good: 검증 → 서비스 호출만
app.post("/materials", requireAuth, async (c) => {
  const input = CreateMaterialSchema.parse(await c.req.json());
  const result = await materialService.create(c.get("user").id, input);
  return c.json({ data: result }, 201);
});

// ❌ Bad: 비즈니스 로직이 Route에
app.post("/materials", async (c) => {
  // 여기서 직접 DB 쿼리, AI 호출 등 하지 말 것
});
```

### Services (규칙의 단일 소스)

- 삭제 정책, 권한 검증, Plan 제약 등 모든 비즈니스 규칙
- 트랜잭션 경계 관리
- AI Layer 호출 조율

### AI Layer (테스트 가능하게)

- Ingestion, Retrieval, Generation 분리
- 외부 API(OpenAI) 호출 격리
- Mock 가능한 인터페이스

---

## 트랜잭션 경계

```typescript
// Service에서 트랜잭션 관리
async function createPlan(input: CreatePlanInput) {
  return db.transaction(async (tx) => {
    const plan = await tx.insert(plans).values({...}).returning();
    await tx.insert(planSourceMaterials).values([...]);
    await tx.insert(planModules).values([...]);
    return plan;
  });
}
```

---

## 공통 미들웨어

### 순서

```typescript
app.use("*", requestId); // 1. 요청 ID 생성
app.use("*", logger); // 2. 로깅
app.use("/api/*", rateLimit); // 3. Rate Limit
app.use("/api/*", cors); // 4. CORS
app.use("/api/*", requireAuth); // 5. 인증 (일부 제외)
app.onError(errorHandler); // 에러 핸들링
```

### Rate Limit

```typescript
const rateLimit = rateLimiter({
  windowMs: 60 * 1000, // 1분
  max: 60, // 60회
  keyGenerator: (c) => c.get("user")?.id || c.req.header("x-forwarded-for"),
});
```

### Error Handler

```typescript
app.onError((err, c) => {
  const requestId = c.get("requestId");
  console.error(`[${requestId}]`, err);

  if (err instanceof AppError) {
    return c.json(
      { error: { code: err.code, message: err.message } },
      err.status,
    );
  }

  return c.json(
    { error: { code: "INTERNAL_ERROR", message: "서버 오류" } },
    500,
  );
});
```

---

## 의존성 규칙

```
Routes → Services → AI Layer
           ↓
         DB/R2
```

- Routes는 Services만 호출
- Services는 AI Layer, DB 접근
- AI Layer는 외부 API 호출

---

## 관련 문서

- [시스템 아키텍처](../architecture.md)
- [API 개요](../api/overview.md)
