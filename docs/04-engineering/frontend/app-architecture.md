# Frontend App Architecture

## 개요

React 프론트엔드의 라우팅, 페이지/컴포넌트 경계, 레이아웃 규칙을 정의합니다.

---

## 라우팅 구조

### React Router v7

```typescript
const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { path: 'home', element: <Home /> },
      { path: 'spaces', element: <Spaces /> },
      { path: 'spaces/:spaceId', element: <SpaceDetail /> },
      { path: 'spaces/:spaceId/documents', element: <Documents /> },
      { path: 'spaces/:spaceId/plans', element: <Plans /> },
      { path: 'plans/:planId', element: <PlanDetail /> },
      { path: 'concepts', element: <ConceptLibrary /> },
      { path: 'concepts/:conceptId', element: <ConceptDetail /> },
    ]
  },
  { path: '/session', element: <SessionMode /> },
]);
```

---

## 페이지/컴포넌트 경계

### 디렉토리 구조

```
src/
├── pages/           # 라우트 단위 페이지
│   ├── home/
│   ├── spaces/
│   └── session/
├── components/      # 재사용 컴포넌트
│   ├── ui/         # 기본 UI (Button, Card 등)
│   └── features/   # 기능별 (PlanCard, SessionStep 등)
├── hooks/          # 커스텀 훅
├── lib/            # 유틸리티
└── api/            # API 클라이언트
```

---

## 레이아웃

### AppLayout

- 사이드바 네비게이션
- 상단 헤더
- 메인 콘텐츠 영역

### SessionMode (풀스크린)

- 레이아웃 없음
- 얇은 상단 헤더만 (진행률)
- 몰입형 콘텐츠

---

## 상태 관리

- **서버 상태**: TanStack Query
- **로컬 상태**: React useState/useReducer
- **전역 상태**: 최소화 (Context로 인증 정도만)

---

## 관련 문서

- [Server State](./server-state.md)
- [기술 스택](../tech-stack.md)
