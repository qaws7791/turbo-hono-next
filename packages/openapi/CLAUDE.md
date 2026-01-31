# packages/openapi

`@repo/openapi`는 `@repo/contracts`를 기반으로 **HTTP Route 정의 + OpenAPI 문서 생성**을 담당합니다.

## Goals

- Route 정의는 코드로 유지하고, OpenAPI 산출물을 항상 재현 가능하게 생성
- `apps/api`는 route를 import해서 `app.openapi(route, handler)` 형태로만 핸들러를 주입

## Commands

```bash
pnpm --filter @repo/openapi generate:openapi
```

산출물: `packages/openapi/src/generated/openapi.json`

## Rules

- Route schema는 `@repo/contracts`의 스키마를 사용합니다.
- `packages/openapi/src/openapi.ts`에서 `extendZodWithOpenApi(...)`가 반드시 한 번 실행되어야 합니다.
