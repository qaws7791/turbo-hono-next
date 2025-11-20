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

```
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

```
features/[feature-name]/
  ├── api/          # API 호출 + React Query hooks
  ├── hooks/        # 커스텀 hooks
  ├── components/   # 기능별 컴포넌트
  └── model/        # Zustand stores (선택)
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

```
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
