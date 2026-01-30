# API Design Conventions

## 개요

**OpenAPI-first** API 설계. 코드와 API 명세가 동기화되도록 `@hono/zod-openapi` 사용.

## 설계 원칙

### 1. OpenAPI-First

**결정**: 코드에서 OpenAPI spec 생성

**근거**:

- **타입 안전**: Zod 스키마가 API contract
- **자동 문서화**: `/docs` 엔드포인트에서 Scalar UI 제공
- **클라이언트 생성**: OpenAPI JSON으로 SDK 생성 가능
- **검증**: 런타임 입력 검증 + 타입 검증

### 2. Resource-Oriented URLs

**RESTful URL 구조**:

```
/api/{resource}              # 목록/생성
/api/{resource}/{id}         # 조회/수정/삭제
/api/{resource}/{id}/{sub}   # 하위 리소스
```

**Examples**:

```
GET    /api/materials              # 목록
POST   /api/materials              # 생성
GET    /api/materials/{id}         # 상세
PATCH  /api/materials/{id}         # 수정
DELETE /api/materials/{id}         # 삭제

GET    /api/plans/{id}/sessions    # 하위 리소스
```

### 3. HTTP Method Semantics

| Method   | Usage      | Idempotent |
| -------- | ---------- | ---------- |
| `GET`    | 조회       | ✅         |
| `POST`   | 생성, 액션 | ❌         |
| `PUT`    | 전체 수정  | ✅         |
| `PATCH`  | 부분 수정  | ❌ (보통)  |
| `DELETE` | 삭제       | ✅         |

## Request/Response Format

### Success Response

**Standard envelope**:

```json
{
  "data": { ... },
  "meta": {          // Optional (pagination 등)
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

**List Response**:

```json
{
  "data": [
    { "id": "1", ... },
    { "id": "2", ... }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

### Error Response

```json
{
  "error": {
    "code": "MATERIAL_NOT_FOUND",
    "message": "학습 자료를 찾을 수 없습니다.",
    "details": { ... },
    "validation": null
  }
}
```

## Route Definition Pattern

### Using @hono/zod-openapi

**Route는 `@repo/api-spec`에서 정의**:

```typescript
// packages/api-spec/src/routes/materials.ts
export const listMaterialsRoute = createRoute({
  method: "get",
  path: "/api/materials",
  tags: ["Materials"],
  summary: "List learning materials",
  request: {
    query: z.object({
      page: z.coerce.number().default(1),
      limit: z.coerce.number().max(100).default(20),
    }),
  },
  responses: {
    200: {
      description: "List of materials",
      content: {
        "application/json": {
          schema: z.object({
            data: z.array(MaterialSchema),
            meta: PaginationMetaSchema,
          }),
        },
      },
    },
  },
});
```

### Route Registration

```typescript
// apps/api/src/routes/materials.ts
export function registerMaterialRoutes(app: OpenAPIHono, deps: AppDeps): void {
  const requireAuth = createRequireAuthMiddleware(deps);

  app.openapi(
    { ...listMaterialsRoute, middleware: [requireAuth] as const },
    async (c) => {
      const auth = c.get("auth");
      const query = c.req.valid("query");

      const result = await deps.services.material.list({
        userId: auth.user.id,
        pagination: { page: query.page, limit: query.limit },
      });

      return handleResult(result, (data) =>
        c.json(
          {
            data: data.items,
            meta: { page: query.page, limit: query.limit, total: data.total },
          },
          200,
        ),
      );
    },
  );
}
```

## 입력 검증

### Zod Schema Guidelines

**1. Coercion for Primitives**:

```typescript
// ✅ Query params는 string으로 들어옴 → coerce
page: z.coerce.number().int().min(1).default(1),
boolean: z.coerce.boolean(),
```

**2. Optional vs Nullable**:

```typescript
// Optional: 키 자체가 없을 수 있음
field: z.string().optional(),

// Nullable: 키는 있지만 null 가능
field: z.string().nullable(),
```

### Validation Locations

| Location  | Schema           | Usage                        |
| --------- | ---------------- | ---------------------------- |
| `query`   | URL query params | 필터링, 페이지네이션         |
| `params`  | Path params      | 리소스 식별자                |
| `headers` | HTTP headers     | Content-Type, custom headers |
| `body`    | JSON body        | 생성/수정 데이터             |

## Response Patterns

### 1. Direct Response (Simple)

```typescript
return c.json({ data: result }, 200);
```

### 2. Result Handler (Async)

```typescript
return handleResult(result, (data) => c.json({ data }, 200));
```

## Status Code Guidelines

### 2xx Success

| Code             | Usage                       |
| ---------------- | --------------------------- |
| `200 OK`         | 일반 성공 (조회, 수정)      |
| `201 Created`    | 리소스 생성 성공            |
| `204 No Content` | 성공했으나 반환 데이터 없음 |

### 4xx Client Errors

| Code                       | Usage            |
| -------------------------- | ---------------- |
| `400 Bad Request`          | 잘못된 요청      |
| `401 Unauthorized`         | 인증 필요/실패   |
| `403 Forbidden`            | 권한 부족        |
| `404 Not Found`            | 리소스 없음      |
| `409 Conflict`             | 리소스 충돌      |
| `410 Gone`                 | 리소스 만료/삭제 |
| `422 Unprocessable Entity` | 검증 실패        |
| `429 Too Many Requests`    | Rate limit 초과  |

### 5xx Server Errors

| Code                        | Usage            |
| --------------------------- | ---------------- |
| `500 Internal Server Error` | 예상치 못한 오류 |
| `502 Bad Gateway`           | 외부 서비스 오류 |
| `503 Service Unavailable`   | 일시적 불가      |

## Pagination

### Offset-based

**결정**: Offset-based (Page + Limit)

**근거**:

- **구현 단순성**: Cursor encoding/decoding 불필요
- **UI 호환성**: 전통적인 페이지 네비게이션
- **데이터 특성**: 쓰기 빈도 낮음, 순서 변화 적음

### Pagination Parameters

```typescript
{
  page: number; // 1-indexed
  limit: number; // max 100
}
```

### Pagination Meta

```json
{
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Special Patterns

### 1. Async Job Creation

**Long-running 작업은 즉시 202 Accepted 반환**:

```typescript
// POST /api/plans (AI generation)
app.openapi(createPlanRoute, async (c) => {
  const result = await deps.services.plan.enqueueGeneration(data);

  return handleResult(result, (job) =>
    c.json(
      {
        data: {
          jobId: job.id,
          status: "pending",
          checkUrl: `/api/jobs/${job.id}`,
        },
      },
      202,
    ),
  );
});
```

### 2. File Upload (Presigned URL)

**Direct upload 피함, presigned URL 사용**:

```
1. POST /api/materials/upload-url
   → { uploadUrl, key, expiresAt }

2. Client가 직접 S3/R2에 업로드

3. POST /api/materials/complete-upload
   → { key, filename, mimeType }
```

## Documentation

### Scalar OpenAPI UI

**Endpoint**: `GET /docs`

**Features**:

- Interactive API explorer
- Request/response examples
- Authentication support

### OpenAPI JSON

**Endpoint**: `GET /openapi.json`

**Usage**:

- 클라이언트 SDK 생성
- 타입 정의 추출
- API diff 검사

## 참고 문서

- [packages/api-spec](../../../packages/api-spec/) - API 명세 정의
- [routes/auth.ts](../../../apps/api/src/routes/auth.ts) - 라우트 예시
- [@hono/zod-openapi](https://github.com/honojs/middleware/tree/main/packages/zod-openapi)
