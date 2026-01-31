# packages/contracts

`@repo/contracts`는 **API/도메인 계약(SSoT)** 을 제공하는 패키지입니다.

## Goals

- HTTP 프레임워크(OpenAPI/Hono 등)와 무관하게 **Zod 스키마 + 타입**만 유지
- `apps/api`, `apps/web`, `packages/core`가 같은 계약을 공유하도록 해 드리프트 방지

## Public API

- `@repo/contracts/common`: 공통 스키마(예: `ErrorResponseSchema`, `PublicIdSchema`)
- `@repo/contracts/<module>`: 도메인별 스키마
  - `auth`, `chat`, `materials`, `plans`, `sessions`

## Rules

- 이 패키지에는 OpenAPI registry, `createRoute` 같은 HTTP/문서 생성 코드는 넣지 않습니다.
- schema 이름 충돌을 피하기 위해(예: `PaginationMetaSchema`) 루트 `index.ts`에서 모듈별 wildcard re-export는 하지 않습니다.
