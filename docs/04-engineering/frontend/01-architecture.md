# Frontend Architecture

## 기술 스택

- **Framework**: [React Router v7](https://reactrouter.com/) (Framework Mode)
- **Language**: TypeScript
- **State Management**: [TanStack Query v5](https://tanstack.com/query/latest)
- **Styling**: Tailwind CSS v4
- **UI Components**: `@repo/ui` (Radix UI + Tailwind 기반 자체 디자인 시스템)
- **API Client**: `openapi-fetch` (Type-safe Fetch)
- **Mocking**: MSW (Mock Service Worker)

## 애플리케이션 유형

이 프로젝트는 **SPA(Single Page Application)** 모드로 동작하도록 설정되어 있습니다.

- **설정 파일**: `apps/web/react-router.config.ts`
- **설정 값**: `ssr: false`

초기 로딩 시 클라이언트 사이드에서 하이드레이션되며, 이후 라우팅은 클라이언트에서 처리됩니다. SEO가 중요한 공개 페이지(Landing 등)와 앱 로직이 중요한 비공개 페이지(App)가 공존하지만, 현재는 개발 생산성과 배포 편의성을 위해 SPA 모드를 채택했습니다.

## 핵심 아키텍처 원칙

### 1. 도메인 주도 설계 (DDD) 지향

비즈니스 로직과 UI를 기능(Domain) 단위로 응집시킵니다. `src/domains` 폴더 하위에 도메인별로 코드를 격리하여 유지보수성을 높입니다.

### 2. 선언적 데이터 페칭

데이터 로딩 로직을 컴포넌트 생명주기나 `useEffect`에 의존하지 않고, **React Router Loaders**와 **TanStack Query**를 결합하여 선언적으로 처리합니다.

- **Route Loader**: 페이지 진입 전 데이터 프리페칭 (옵션)
- **UseQuery**: 컴포넌트 레벨에서의 데이터 구독 및 캐싱

### 3. 타입 안전성 (Type Safety)

API 스키마(OpenAPI)부터 프론트엔드 컴포넌트까지 이어지는 End-to-End 타입 안전성을 추구합니다.

- 백엔드 스펙(`openapi.json`)을 기반으로 TypeScript 타입을 자동 생성합니다.
- `zod`를 사용하여 런타임 데이터 검증을 수행합니다.
