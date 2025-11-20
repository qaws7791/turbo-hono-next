# @repo/api-spec

REST API 명세 정의 - OpenAPI 문서 자동 생성 및 타입 안전성 제공

## Purpose

- Zod 스키마로 API 요청/응답 정의
- Hono OpenAPI 라우트 정의
- Frontend 타입 생성 소스 (openapi.json)
- Backend 핸들러의 계약(contract)

## Key Structure

```
modules/[module-name]/
  ├── schema.ts    # Zod 스키마
  └── routes.ts    # createRoute 정의
```

## Important Rules

1. **API-First 접근** - 구현 전에 스펙 정의
2. **모든 라우트는 default error response 포함**
3. **Protected 라우트는 `security: [{ cookieAuth: [] }]` 추가**
4. **RESTful 경로 사용** - `/plans` (O), `/getPlans` (X)
5. **Korean descriptions** - API 문서에 한글 설명 사용

## Workflow: Adding API Endpoint

1. `modules/[module]/schema.ts`에 request/response 스키마 정의
2. `modules/[module]/routes.ts`에 createRoute 정의
3. `pnpm docs:generate` 실행 → `dist/openapi.json` 생성
4. Frontend: `pnpm --filter web schema:generate` 실행
5. Backend에서 핸들러 구현

## Common Patterns

- **Pagination**: `cursorPaginationQuerySchema` 사용
- **Error response**: `errorResponseSchema` (모든 라우트에 필수)
- **File upload**: `multipart/form-data` content type 사용

## Design Note

스펙 변경 시 docs:generate → schema:generate 순서로 실행 필수
