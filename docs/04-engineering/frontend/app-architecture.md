# Frontend App Architecture

## 개요

`apps/web` 프론트엔드의 라우팅, 레이아웃, 디렉토리 경계(라우트/기능/UI)를 정의합니다.

---

## 라우팅 구조

### React Router v7 (SPA mode)

- 라우트 정의: `apps/web/app/routes.ts`
- SPA 모드: `apps/web/react-router.config.ts` (`ssr: false`)

라우트는 `@react-router/dev/routes`의 `index / route / layout` 구성을 사용합니다.

### 주요 라우트

**외부(인증 전/공통)**

- `/` 랜딩
- `/login` 로그인
- `/logout` 로그아웃 액션
- `/session` 풀스크린 학습 세션

**AppShell 레이아웃(인증 필요)**

- `/home` 홈
- `/today` 오늘 할 일
- `/spaces` 스페이스 목록
- `/concepts` 전역 개념 라이브러리
- `/concept/:conceptId` 개념 상세
- `/spaces/:spaceId` Space 상세(기본: 학습 계획 탭)
  - `/spaces/:spaceId/documents` 문서 탭
  - `/spaces/:spaceId/plans/new` Plan 생성 위저드
  - `/spaces/:spaceId/concepts` 개념 탭
  - `/spaces/:spaceId/plan/:planId` Plan 상세

---

## 디렉토리 경계

```
apps/web/app/
├── routes/          # 라우트 모듈(Loader/Action + 화면 진입점)
├── features/        # 기능 단위 UI + 모델(뷰/뷰모델)
├── hooks/           # 앱 공용 훅
├── lib/             # 유틸/헬퍼(스토리지, 시간 등)
└── mock/            # 프로토타입용 로컬 mock 데이터/로직
```

### 규칙

- `routes/*`: 데이터 로딩/뮤테이션(React Router clientLoader/clientAction)과 화면 진입만 담당
- `features/*`: UI와 사용자 상호작용(상태/로직)을 기능 단위로 캡슐화
- `mock/*`: 실제 API 전환 전까지의 임시 저장소/도메인 로직

---

## 레이아웃

### AppShell (인증 후 기본 레이아웃)

- 사이드바 네비게이션
- 커맨드 팔레트(단축키 `Cmd/Ctrl + K`)
- 설정 다이얼로그(단축키 `Cmd/Ctrl + ,`)
- `Outlet`으로 페이지 렌더

### Session (풀스크린)

- AppShell 밖에서 동작
- 상단 최소 헤더 + 진행률 중심
- 세션 이탈/복구 UX를 위해 독립 “모드”로 취급

---

## 인증 게이팅

- AppShell 레이아웃 라우트에서 인증 상태를 확인
- 미인증 시 `/login?redirectTo=...`로 리다이렉트
