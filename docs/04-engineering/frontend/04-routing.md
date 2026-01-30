# Routing

React Router v7의 `RouteConfig` 방식을 사용하여 라우팅을 구성합니다.

## Configuration

라우트 정의는 `apps/web/src/routes.ts` 파일에 집중되어 있습니다. 파일 시스템 기반 라우팅(File-based routing) 대신 명시적인 설정(Config-based routing)을 사용하여 라우트 구조를 한눈에 파악하기 쉽게 관리합니다.

```typescript
// apps/web/src/routes.ts
export default [
  index("routes/landing.tsx"), // /
  route("login", "routes/login.tsx"), // /login

  // App Shell Layout (인증 필요한 페이지들)
  layout("routes/app-layout.tsx", [
    route("home", "routes/home.tsx"),
    route("materials", "routes/materials.tsx"),
    // ...
  ]),
] satisfies RouteConfig;
```

## Route Components (`src/routes/`)

`src/routes` 폴더의 파일들은 각 URL 경로에 매핑되는 **Page Component**입니다.

- **역할**:
  - URL 파라미터 읽기 (`useParams`)
  - 데이터 로더 연결 (필요 시)
  - 도메인 컴포넌트(`domains/*/ui`) 배치 및 조립
  - 레이아웃 구성

**안티 패턴**:

- 라우트 컴포넌트 내부에 복잡한 비즈니스 로직이나 거대한 UI 코드를 직접 작성하지 마십시오. 로직은 `domains`로 위임해야 합니다.

## Navigation

페이지 이동은 React Router의 표준 `<Link>` 컴포넌트나 `useNavigate` 훅을 사용합니다.

```tsx
import { Link } from "react-router";

<Link to="/plans/new">Create Plan</Link>;
```
