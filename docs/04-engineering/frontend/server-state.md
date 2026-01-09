# Client Data Flow (Prototype)

## 개요

현재 `apps/web` 프로토타입은 TanStack Query를 사용하지 않고, **React Router v7의 data API(clientLoader/clientAction) + useFetcher** 패턴으로 데이터 로딩/뮤테이션을 구성합니다.

---

## 기본 패턴

### 1) 로딩: Route `clientLoader`

- 라우트 진입 시 필요한 데이터를 `clientLoader`에서 준비
- 반환값은 `useLoaderData()`로 읽음

예:

- `apps/web/app/routes/home.tsx`
- `apps/web/app/routes/materials.tsx`

### 2) 뮤테이션: Route `clientAction`

- 폼/버튼 액션은 `clientAction`에서 처리
- 성공 시:
  - `redirect()`로 이동하거나
  - `null`을 반환해 현재 화면에 머무름

예:

- 문서 업로드/삭제: `apps/web/app/routes/materials.tsx`
- 플랜 생성: `apps/web/app/routes/plan-wizard.tsx`

### 3) 화면 내 제출: `useFetcher()`

- 페이지 이동 없이 제출/로딩 상태를 얻기 위해 `useFetcher()`를 사용
- 모달/탭 내부 액션에 적합

예:

- 문서 업로드 다이얼로그 제출
- Plan 생성 위저드 제출

---

## 데이터 소스

### 프로토타입(mock)

- 현재는 `apps/web/app/mock/api.ts`의 in-memory(스토리지 기반) mock 로직을 호출
- 추후 실제 API로 교체 시, 라우트 모듈의 의존성을 API 클라이언트로 치환하는 방식으로 전환

---

## 에러/리다이렉트 규칙

- 인증 필요 라우트는 레이아웃에서 `/login?redirectTo=...`로 리다이렉트
- 파라미터 검증 실패는 400/404를 명확히 반환(예: UUID 파싱)
