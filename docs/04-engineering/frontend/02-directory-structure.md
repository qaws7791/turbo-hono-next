# Directory Structure

`apps/web/src` 디렉토리는 크게 4가지 핵심 영역으로 구분됩니다.

```
src/
├── app/            # 전역 앱 설정 및 공통 요소
├── domains/        # 비즈니스 도메인 (기능) 모듈
├── foundation/     # 기반 인프라 및 유틸리티
└── routes/         # React Router 라우트 정의
```

## 1. `app/` (Application Core)

애플리케이션의 쉘(Shell) 역할을 하는 코드들이 위치합니다.

- **providers/**: 전역 Context Provider (QueryProvider, ThemeProvider 등)
- **styles/**: 전역 CSS 및 Tailwind 설정
- **mocks/**: MSW 핸들러 및 설정
- `root.tsx`에서 이 디렉토리의 모듈들을 조합하여 앱을 구동합니다.

## 2. `domains/` (Feature Modules)

비즈니스 로직과 UI가 응집된 핵심 디렉토리입니다. 각 도메인은 독립적인 모듈처럼 구성됩니다.

**구조 예시 (`domains/materials/`):**

```
materials/
├── api/            # 해당 도메인 전용 API 호출 함수
├── application/    # 도메인 로직, 커스텀 훅 (useCase)
├── model/          # 타입 정의, Zod 스키마, 상수
├── ui/             # 해당 도메인 전용 컴포넌트
├── index.ts        # 외부로 노출할 모듈 (Public API)
└── materials.queries.ts # React Query 옵션 팩토리
```

- **원칙**: 도메인 간의 의존성은 최소화하며, 필요한 경우 `index.ts`를 통해서만 참조합니다.

## 3. `foundation/` (Infrastructure)

특정 도메인에 종속되지 않는 공통 기술 기반 코드입니다.

- **api/**: Axios/Fetch 클라이언트 인스턴스, 에러 처리 로직
- **lib/**: 범용 유틸리티 (날짜 포맷팅, 로컬 스토리지 래퍼 등)
- **types/**: 전역 타입 정의 (API 스키마 generated 타입 등)
- **hooks/**: 범용 커스텀 훅 (useDebounce, useMediaQuery 등)

## 4. `routes/` (Routing Layer)

React Router v7의 라우트 컴포넌트들입니다.

- 실제 비즈니스 로직은 포함하지 않으며, **페이지 진입점(Entry Point)** 역할만 수행합니다.
- 주로 `domains`의 컴포넌트를 조립하고, `loader/action`을 연결하는 역할을 합니다.
- **Naming**: URL 경로와 유사하게 파일명을 짓습니다 (예: `login.tsx`, `plan-detail.tsx`).
