# API 설계 원칙

## 개요

이 문서는 Learning OS API의 설계 원칙, 공통 규약, 응답/에러 포맷을 정의합니다.

---

## 기본 원칙

### 1. RESTful 설계

- 리소스 중심 URL 설계
- HTTP 메서드로 동작 표현
- 상태 없는(Stateless) 요청

### 2. 타입 안전성

- Zod 스키마로 요청/응답 검증
- zod-openapi로 스펙 자동 생성
- 프론트-백 타입 공유

### 3. 일관성

- 모든 응답은 동일한 포맷
- 에러도 표준화된 형식
- 예측 가능한 동작

---

## 버전 관리

현재 API는 URL path에 버전을 두지 않습니다(예: `/api/materials`, `/api/plans`).

### 버전 정책

- **Major 변경**: 필요 시 버전 도입/증가 (예: v1 → v2)
- **Minor 변경**: 하위 호환, 필드 추가
- **Deprecation**: 최소 3개월 유지 후 제거

---

## 공통 규약

### URL 규칙

| 규칙          | 예시                                                  |
| ------------- | ----------------------------------------------------- |
| 복수형 리소스 | `/api/materials`, `/api/plans`                        |
| kebab-case    | `/plan-sessions`                                      |
| ID는 UUID     | `/api/materials/550e8400-e29b-41d4-a716-446655440000` |

### HTTP 메서드

| 메서드 | 용도      | 멱등성 |
| ------ | --------- | ------ |
| GET    | 조회      | ✓      |
| POST   | 생성      | ✗      |
| PUT    | 전체 교체 | ✓      |
| PATCH  | 부분 수정 | ✓      |
| DELETE | 삭제      | ✓      |

### 상태 코드

| 코드 | 용도                        |
| ---- | --------------------------- |
| 200  | 성공 (조회, 수정)           |
| 201  | 생성 성공                   |
| 202  | 비동기 작업 수락            |
| 204  | 성공, 응답 본문 없음 (삭제) |
| 400  | 잘못된 요청                 |
| 401  | 인증 필요                   |
| 403  | 권한 없음                   |
| 404  | 리소스 없음                 |
| 409  | 충돌 (중복 등)              |
| 422  | 검증 실패                   |
| 429  | 요청 한도 초과              |
| 500  | 서버 오류                   |

---

## 응답 포맷

### 성공 응답

```typescript
// 단일 리소스
{
  "data": {
    "id": "uuid",
    "type": "material",
    "attributes": { ... }
  }
}

// 목록 (간소화)
{
  "data": [
    { "id": "uuid", ... },
    { "id": "uuid", ... }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20
  }
}
```

### 에러 응답

```typescript
{
  "error": {
    "code": "MATERIAL_NOT_FOUND",
    "message": "요청한 자료를 찾을 수 없습니다.",
    "details": {
      "materialId": "uuid"
    }
  }
}
```

---

## Pagination

### Offset 기반

```
GET /api/materials?page=1&limit=20
```

```typescript
interface PaginationMeta {
  total: number; // 전체 개수
  page: number; // 현재 페이지 (1-indexed)
  limit: number; // 페이지당 개수
  totalPages: number; // 전체 페이지 수
}
```

### 기본값

| 파라미터 | 기본값 | 최대값 |
| -------- | ------ | ------ |
| page     | 1      | -      |
| limit    | 20     | 100    |

---

## Sorting

```
GET /api/materials?sort=createdAt:desc
GET /api/materials?sort=title:asc
```

### 복합 정렬

```
GET /api/materials?sort=status:asc,createdAt:desc
```

---

## Filtering

### 단순 필터

```
GET /api/materials?status=READY
```

### 복합 필터

```
GET /api/materials?status=READY&sourceType=FILE
```

### 검색

```
GET /api/materials?search=react
```

---

## 요청 헤더

### 필수

| 헤더         | 값               | 설명           |
| ------------ | ---------------- | -------------- |
| Content-Type | application/json | 요청 본문 형식 |
| Accept       | application/json | 응답 형식      |

### 인증

| 헤더   | 값          | 설명                 |
| ------ | ----------- | -------------------- |
| Cookie | session=... | 세션 쿠키 (httpOnly) |

### 선택

| 헤더            | 값   | 설명           |
| --------------- | ---- | -------------- |
| Idempotency-Key | uuid | 중복 요청 방지 |
| X-Request-ID    | uuid | 요청 추적      |

---

## 응답 헤더

| 헤더                  | 값         | 설명                       |
| --------------------- | ---------- | -------------------------- |
| X-Request-ID          | uuid       | 요청 ID (로그 추적)        |
| X-RateLimit-Limit     | 60         | 분당 최대 요청 수          |
| X-RateLimit-Remaining | 45         | 남은 요청 수               |
| X-RateLimit-Reset     | 1234567890 | 리셋 시각 (Unix timestamp) |

---

## OpenAPI 스펙

### 생성 방법

```typescript
// zod-openapi 사용
import { createRoute, z } from "@hono/zod-openapi";

const createMaterialRoute = createRoute({
  method: "post",
  path: "/api/materials",
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: CreateMaterialSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: MaterialResponseSchema,
        },
      },
      description: "생성 성공",
    },
  },
});
```

### 문서 URL

```
GET /docs        # Swagger UI
GET /openapi.json  # OpenAPI 스펙
```

### CI 검증

```yaml
# .github/workflows/api-check.yml
- name: Validate OpenAPI spec
  run: pnpm run openapi:validate

- name: Check breaking changes
  run: pnpm run openapi:diff
```

---

## API 엔드포인트 목록

| 리소스    | 문서                           |
| --------- | ------------------------------ |
| 인증      | [auth.md](./auth.md)           |
| 에러      | [errors.md](./errors.md)       |
| Materials | [materials.md](./materials.md) |
| Plans     | [plans.md](./plans.md)         |
| Sessions  | [sessions.md](./sessions.md)   |
| Chat      | [chat.md](./chat.md)           |

---

## 관련 문서

- [시스템 아키텍처](../architecture.md)
- [에러 코드](./errors.md)
- [인증](./auth.md)
