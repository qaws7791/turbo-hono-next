# Pragmatic FSD 리팩토링 계획

## 목표 구조

```
apps/web/src/               # 기존 app → src로 변경
├── app/                    # Layer 1: 전역 설정
│   ├── providers/          # React Context Providers
│   ├── styles/             # 글로벌 스타일
│   └── mocks/              # MSW 설정 (개발용)
│
├── foundation/             # Layer 2: 도메인 무관 기초 레이어
│   ├── api/                # API 클라이언트 (openapi-fetch)
│   ├── hooks/              # 범용 커스텀 훅
│   ├── lib/                # 유틸리티 함수
│   └── types/              # 생성된 API 타입
│
├── domains/                # Layer 3: 비즈니스 도메인
│   └── {domain}/
│       ├── model/          # 타입, 상수, 비즈니스 로직 (순수 TS)
│       ├── ui/             # 컴포넌트 (.tsx)
│       ├── application/    # 훅, 상태 관리
│       └── api/            # 도메인별 API 호출
│
└── routes/                 # Layer 4: 페이지 (Composition Root)
```

## 리팩토링 단계

### Phase 1: Foundation 레이어 구성 ✅

- [x] `foundation/` 디렉토리 생성
- [x] `hooks/` → `foundation/hooks/` 이동
- [x] `lib/` → `foundation/lib/` 이동
- [x] `types/` → `foundation/types/` 이동
- [x] `api/` → `foundation/api/` 이동
- [x] `foundation/index.ts` 배럴 파일 생성

### Phase 2: App 레이어 구성 ✅

- [x] `src/app/` 디렉토리 생성
- [x] `mocks/`, `mock/` → `app/mocks/` 통합
- [x] `app.css` → `app/styles/` 이동
- [x] `root.tsx` import 경로 업데이트
- [x] 모든 import 경로 일괄 업데이트
- [x] 타입 체크 통과

### Phase 3: 도메인별 4-Layer 구조 리팩토링 ✅

모든 도메인에 model/ui/application/api 레이어 적용 완료:

- [x] **app-shell** - 앱 쉘 (사이드바, 헤더, 레이아웃)
- [x] **auth** - 인증 (로그인)
- [x] **concepts** - 개념 관리
- [x] **documents** - 문서 관리
- [x] **home** - 홈 화면
- [x] **landing** - 랜딩 페이지
- [x] **plans** - 학습 계획
- [x] **session** - 학습 세션 (API 레이어 포함)
- [x] **settings** - 설정
- [x] **spaces** - 스페이스
- [x] **today** - 오늘 할 일

### Phase 4: 설정 파일 업데이트 ✅

- [x] `react-router.config.ts` - appDirectory: "src"
- [x] `tsconfig.json` - paths: ~/_ → ./src/_
- [x] `package.json` - 스크립트 경로 업데이트

## 진행 상태

- 시작일: 2026-01-04
- Phase 1: ✅ 완료
- Phase 2: ✅ 완료
- Phase 3: ✅ 완료
- Phase 4: ✅ 완료

## 현재 구조

```
apps/web/src/
├── app/           ✅ 전역 설정 (mocks, styles, providers)
├── foundation/    ✅ 기초 레이어 (api, hooks, lib, types)
├── domains/       ✅ 도메인 4-Layer 구조
│   ├── app-shell/
│   │   ├── model/         # types.ts
│   │   ├── ui/            # app-shell.tsx, app-sidebar.tsx 등
│   │   ├── application/   # use-app-shell-state.ts 등
│   │   └── index.ts       # 배럴 파일
│   ├── auth/
│   │   ├── model/         # types.ts, format-seconds.ts
│   │   ├── ui/            # login-view.tsx
│   │   ├── application/   # use-login-view-model.ts
│   │   └── index.ts
│   ├── concepts/
│   │   ├── model/         # types.ts, get-latest-concept-source.ts
│   │   ├── ui/            # concept-card.tsx 등
│   │   ├── application/   # use-concept-detail-model.ts 등
│   │   └── index.ts
│   ├── documents/
│   │   ├── model/         # document-status.ts
│   │   ├── ui/            # space-documents-view.tsx
│   │   ├── application/   # use-space-documents-model.ts
│   │   └── index.ts
│   ├── home/
│   │   ├── ui/            # home-view.tsx
│   │   ├── application/   # use-home-model.ts (HomeModel type)
│   │   └── index.ts
│   ├── landing/
│   │   ├── ui/            # landing-view.tsx
│   │   ├── application/   # use-landing-model.ts
│   │   └── index.ts
│   ├── plans/
│   │   ├── model/         # types.ts, wizard-types.ts
│   │   ├── ui/            # plan-detail-view.tsx 등
│   │   ├── application/   # use-plan-detail-model.ts 등
│   │   └── index.ts
│   ├── session/           ⭐ API 레이어 포함
│   │   ├── model/         # types.ts
│   │   ├── ui/            # session-view.tsx
│   │   ├── application/   # use-session-controller.ts
│   │   ├── api/           # session-api.ts
│   │   └── index.ts
│   ├── settings/
│   │   ├── ui/            # settings-dialog.tsx
│   │   └── index.ts
│   ├── spaces/
│   │   ├── model/         # types.ts
│   │   ├── ui/            # spaces-view.tsx, icon-color-picker.tsx 등
│   │   ├── application/   # use-spaces-model.ts 등
│   │   └── index.ts
│   └── today/
│       ├── ui/            # today-view.tsx
│       └── index.ts
├── routes/        ✅ 페이지 레이어 (18개 라우트)
├── root.tsx       앱 엔트리 포인트
├── routes.ts      라우팅 설정
└── env.d.ts       환경 변수 타입
```

## 아키텍처 규칙

### Layer Dependencies

```
routes → domains → foundation → app
```

### Import 규칙

1. **배럴 파일 사용**: 도메인 외부에서는 `~/domains/{domain}` 형태로 import
2. **상대 경로**: 도메인 내부에서는 `../model`, `../application` 형태로 import
3. **Foundation 접근**: 모든 레이어에서 `~/foundation/...` 형태로 접근

### 도메인 4-Layer 구조

- **model/**: 순수 TypeScript (타입, 상수, 비즈니스 로직)
- **ui/**: React 컴포넌트 (.tsx)
- **application/**: React hooks, context, store
- **api/**: API 호출 및 DTO 매핑 (선택적)
