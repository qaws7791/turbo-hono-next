# Data Fetching & State Management

## Overview

데이터 페칭 전략은 **Server State** 관리와 **API 통신**의 효율성을 중심으로 설계되었습니다.

- **Client**: `openapi-fetch` (Type-safe lightweight client)
- **State**: `TanStack Query` (Caching, Deduping, Synchronization)
- **Interface**: Query Key Factory Pattern

## API Client Setup

`foundation/api/client.ts` (가칭)에서 생성된 클라이언트를 사용하여 API 요청을 보냅니다. 백엔드의 OpenAPI 스펙을 기반으로 생성된 타입을 사용하여 요청과 응답의 타입 안전성을 보장합니다.

```typescript
// 예시 코드
import createClient from "openapi-fetch";
import type { paths } from "~/foundation/types/api";

export const client = createClient<paths>({ baseUrl: "/api" });
```

## Query Key Factory Pattern

React Query의 Query Key를 문자열 하드코딩 대신 팩토리 함수로 관리하여 키 관리를 체계화합니다. 각 도메인 폴더의 `*.queries.ts` 파일에 정의합니다.

**Example (`domains/materials/materials.queries.ts`):**

```typescript
import { queryOptions } from "@tanstack/react-query";
import { listMaterials } from "./api/materials.api";

export const materialsQueries = {
  all: () => ["materials"] as const,
  lists: () => [...materialsQueries.all(), "list"] as const,
  list: (params) =>
    queryOptions({
      queryKey: [...materialsQueries.lists(), params],
      queryFn: () => listMaterials(params),
    }),
};
```

**Usage (Component):**

```typescript
import { useQuery } from "@tanstack/react-query";
import { materialsQueries } from "~/domains/materials";

function MaterialList() {
  const { data } = useQuery(materialsQueries.list({ page: 1 }));
  // ...
}
```

## Mocking (MSW)

개발 단계(Backend API 미완성 시)나 테스트 환경에서는 **MSW(Mock Service Worker)**를 사용하여 네트워크 요청을 가로채고 모의 데이터를 반환합니다.

- **Handlers**: `apps/web/src/app/mocks/handlers.ts`
- **Activation**: `apps/web/src/root.tsx`에서 개발 모드(`DEV`) 또는 `VITE_MSW` 환경변수가 활성화된 경우 실행됩니다.

API가 준비되면 MSW 핸들러를 비활성화하거나 제거하는 대신, 테스트용으로 유지하는 것을 권장합니다.
