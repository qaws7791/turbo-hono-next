# 모듈 경계 및 레이어 규칙

> **NOTE**: 이 문서는 현재 아키텍처와 일부 차이가 있습니다. 최신 정보는 [01-architecture](./01-architecture.md)를 참조하세요.

## 개요

백엔드 코드의 Layer 분리 규칙, 트랜잭션 경계, 공통 미들웨어를 정의합니다.

---

## 레이어 구조 (Current)

```
apps/api/src/
├── routes/              # L1: HTTP/Application Layer
│   ├── index.ts         # 라우트 등록
│   ├── auth.ts
│   ├── materials.ts
│   ├── plans.ts
│   └── sessions.ts
├── middleware/          # Cross-cutting concerns
│   ├── auth.ts          # 인증/인가
│   ├── error-handler.ts
│   ├── logger.ts
│   ├── rate-limit.ts
│   ├── request-id.ts
│   └── secure-headers.ts
└── lib/                 # Utilities
    ├── config.ts        # 환경 설정 (Zod)
    ├── db.ts            # Prisma client
    ├── errors.ts
    ├── logger.ts
    ├── ownership.ts
    ├── r2.ts            # R2 client
    ├── result-handler.ts
    ├── result.ts
    └── zod.ts

packages/core/src/modules/
├── auth/                # 인증 도메인
├── material/            # 학습 자료 도메인
├── plan/                # 학습 계획 도메인
├── session/             # 학습 세션 도메인
└── knowledge/           # RAG/지식 베이스
```

---

## 레이어 규칙

### Routes (얇게 유지)

**원칙**: Route는 HTTP 관심사만 처리

```typescript
// ✅ Good: 검증 → Service 호출만
app.openapi(route, async (c) => {
  const body = c.req.valid('json');
  const result = await deps.services.material.create(body);
  return handleResult(result, (data) => c.json({ data }, 201));
});

// ❌ Bad: 비즈니스 로직이 Route에
app.openapi(route, async (c) => {
  // 여기서 직접 DB 쿼리, AI 호출 등 하지 말 것
  const data = await db.insert(...); // ❌
});
```

### Core Services (Business Logic)

**packages/core/modules/{domain}/api/index.ts**

- 비즈니스 규칙의 단일 소스
- 트랜잭션 경계 관리
- Port/Adapter 패턴 적용
- Result<T, Error> 반환

```typescript
// Core Service는 HTTP에 의존하지 않음
export async function createMaterial(
  input: CreateMaterialInput,
): Promise<Result<Material, CoreError>> {
  // 비즈니스 로직
  // Repository 호출
  // Result 반환
}
```

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

## Core 내부 구조 (Clean Architecture)

```
modules/{domain}/
├── api/                    # 외부 인터페이스
│   ├── index.ts            # Service facade
│   ├── ports.ts            # 출력 포트 (driven adapters)
│   └── schema.ts           # 입력 검증 (Zod)
└── internal/
    ├── domain/             # 순수 도메인 로직
    │   ├── types.ts
    │   └── utils.ts
    ├── application/        # 유스케이스
    │   └── *.ts
    └── infrastructure/     # 어댑터 구현
        ├── *.repository.ts
        └── adapters/*.adapter.ts
```

### 의존성 규칙

```
Routes → Core Services → Ports → Adapters
                ↓
            DB/R2/AI
```

- Routes는 Core Services만 호출
- Core Services는 Ports(인터페이스)에 의존
- Adapters는 Ports 구현

---

## 관련 문서

- [01-architecture](./01-architecture.md) - 현재 아키텍처 (권장)
- [02-error-handling](./02-error-handling.md) - 에러 처리
- [03-authentication](./03-authentication.md) - 인증/세션
- [packages/core](../../../packages/core/) - Core 모듈 상세
