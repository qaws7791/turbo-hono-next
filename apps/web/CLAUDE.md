# apps/web

Vite + React 프론트엔드 - TanStack Router/Query, React Aria Components

## Purpose

- 학습 로드맵 서비스 UI
- 타입 안전 API 클라이언트
- 실시간 AI 채팅
- 접근성 우선 디자인

## Tech Stack

- **Build**: Vite
- **Framework**: React 19
- **Router**: TanStack Router (file-based)
- **State**: TanStack Query (server) + Zustand (client)
- **UI**: React Aria Components (@repo/ui)
- **Styling**: Tailwind CSS v4

## Directory Structure

```text
src/
  ├── routes/              # 파일 기반 라우팅
  ├── features/            # 기능별 모듈
  │   ├── auth/
  │   ├── learning-plan/
  │   ├── ai-chat/
  │   └── progress/
  ├── shared/              # 공유 유틸/컴포넌트
  ├── api/                 # 생성된 API 타입
  └── app/                 # 앱 설정
```

## Feature Structure

```text
features/[feature-name]/
  ├── model/        # 도메인 모델 (비즈니스 엔티티)
  │   ├── types.ts      # 도메인 타입 정의
  │   ├── mappers.ts    # API → 도메인 변환 함수
  │   └── utils.ts      # 도메인 로직 유틸리티 (선택)
  ├── api/          # API 계층
  │   ├── types.ts      # API 응답 타입 (paths에서 추출)
  │   ├── *-service.ts  # API 호출 함수
  │   └── *-queries.ts  # React Query options
  ├── hooks/        # 커스텀 hooks
  └── components/   # 기능별 컴포넌트
```

### 도메인 모델 패턴

**원칙**: API 응답 구조와 독립적인 비즈니스 엔티티 정의

**이점**:

- API 변경에 대한 영향 최소화 (변환 레이어가 격리)
- 컴포넌트는 안정된 도메인 모델만 의존
- UI 로직에 필요한 computed properties 추가 가능
- 테스트 용이성 향상 (도메인 모델 mock 쉬움)

**구현 예시** ([features/auth](./src/features/auth), [features/progress](./src/features/progress)):

1. **`model/types.ts`** - 도메인 엔티티 정의

   ```typescript
   export interface User {
     readonly id: string;
     readonly username: string;
     readonly email: string;
   }
   ```

2. **`api/types.ts`** - API 응답 타입만 정의

   ```typescript
   import type { paths } from "@/api/schema";

   export type ApiUser =
     paths["/auth/me"]["get"]["responses"][200]["content"]["application/json"];
   ```

3. **`model/mappers.ts`** - 변환 함수

   ```typescript
   import type { ApiUser } from "../api/types";
   import type { User } from "./types";

   export function mapApiUserToUser(apiUser: ApiUser): User {
     return {
       id: apiUser.id,
       username: apiUser.name, // API 필드명 변환
       email: apiUser.email,
     };
   }
   ```

4. **`api/*-service.ts`** - 변환 적용

   ```typescript
   import { mapApiUserToUser } from "../model/mappers";
   import type { User } from "../model/types";

   export async function fetchCurrentUser(): Promise<User | null> {
     const response = await api.auth.me();
     if (response.error || !response.data) return null;
     return mapApiUserToUser(response.data);
   }
   ```

5. **컴포넌트** - 도메인 모델 사용

   ```typescript
   import type { User } from "@/features/auth/model/types";

   function UserProfile({ user }: { user: User }) {
     return <div>{user.username}</div>; // API 구조와 무관
   }
   ```

## Important Rules

1. **서버 데이터는 TanStack Query만** - useEffect 금지
2. **API 타입은 생성된 것 사용** - `src/api/schema.ts`
3. **UI 컴포넌트는 @repo/ui에서** - 직접 구현 최소화
4. **파일 기반 라우팅** - `routes/` 구조가 URL과 매칭
5. **Protected routes는 layout에서 체크**

## State Management

- **Server state**: TanStack Query (cache, refetch, optimistic updates)
- **Client state**: Zustand (UI 상태, 모달 등)
- **Form state**: React Aria Form (간단) / React Hook Form (복잡)

## Routing

```text
routes/
  ├── __root.tsx                           # Root layout
  ├── index.tsx                            # /
  ├── login/index.tsx                      # /login
  └── app/
      ├── _layout.tsx                      # /app (auth required)
      ├── learning-plans/
      │   └── $learningPlanId/index.tsx   # /app/learning-plans/:id
```

## API Integration

1. Backend 변경 후 `pnpm schema:generate` 실행
2. `openapi-fetch` + 생성된 타입으로 타입 안전 호출
3. Feature API 모듈에서 wrapper 함수 작성
4. React Query hooks로 래핑

## AI Chat

- `@ai-sdk/react`의 `useChat` 사용
- 스트리밍 응답 자동 처리
- Tool invocations는 message.toolInvocations에서 확인

## Design Notes

- Port 4000 (기본)
- API URL: `VITE_API_URL` 환경변수
- Cookie auth (credentials: 'include')
- CSS import 필수: `@repo/ui/components.css`
