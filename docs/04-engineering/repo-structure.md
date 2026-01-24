# 저장소 구조 (v1 스냅샷)

이 문서는 `turbo-local-market` 모노레포의 **v2 백엔드 작업(2단계: 기존 백엔드 제거) 직전 상태를 기록한 스냅샷**입니다. v2 구현(3단계) 진행 중에는 실제 파일 트리와 다를 수 있습니다.

## Top-level

```
turbo-local-market/
├─ apps/
│  ├─ api/            # Hono 백엔드 (현 구현)
│  ├─ web/            # React Router v7 프론트엔드
│  └─ storybook/      # @repo/ui 컴포넌트 개발 환경
├─ packages/
│  ├─ ai-types/       # AI SDK v5 공유 타입/스키마
│  ├─ api-spec/       # Zod + createRoute 기반 API 계약 (OpenAPI 생성)
│  ├─ config/         # ESLint/Prettier/TSConfig 공유 설정
│  ├─ database/       # Drizzle 스키마 + DB 클라이언트(Neon)
│  ├─ ui/             # 공유 UI 컴포넌트 라이브러리
│  ├─ eslint-config/  # (현재는 실사용 흔적이 약함)
│  └─ typescript-config/ # (현재는 실사용 흔적이 약함)
├─ docs/              # 제품/설계/엔지니어링 문서 (v2 스펙 포함)
├─ turbo.json         # Turborepo task + global env
├─ pnpm-workspace.yaml # Workspaces + catalog 버전 관리
├─ package.json       # 루트 스크립트(터보 실행)
└─ prettier/eslint/commitlint 설정들
```

### 워크스페이스/빌드

- **pnpm workspaces**: `pnpm-workspace.yaml`에 `apps/*`, `packages/*` 등록 + `catalog:`로 공통 버전 관리.
- **Turborepo tasks**: `turbo.json`의 `build/dev/deploy/lint/typecheck/format`를 각 워크스페이스에서 실행.
- **공유 설정**: `@repo/config`가 ESLint v9(flat), Prettier, tsconfig preset 제공.

## Apps

### `apps/api` (현 백엔드)

**기술**: Hono + `@hono/zod-openapi`, Drizzle(Neon), Pino 로깅, 쿠키 기반 인증, R2 업로드, AI 기능(스트리밍 포함).

**엔트리포인트**

- `apps/api/src/index.ts`: Node 서버 구동(현재 코드상 기본 포트는 3999).
- `apps/api/src/app.ts`: OpenAPIHono 앱 구성, CORS/로깅/에러 핸들러, `/ui`(Scalar), `/doc`(OpenAPI JSON).
- `apps/api/api/index.ts`: Vercel handler(빌드 산출물 `dist/`를 import).

**`src/` 주요 레이어**

```
apps/api/src/
├─ config/        # env schema + auth 설정
├─ database/      # DB client 생성(createDb 래핑)
├─ errors/        # BaseError + ErrorCodes + 글로벌 error handler
├─ external/      # 외부 연동(AI provider/prompt, email 등)
├─ lib/           # 로깅/트랜잭션/권한/페이지네이션 등의 공통 유틸
├─ middleware/    # auth, logger 등 cross-cutting
├─ modules/       # 도메인 모듈 (라우트/서비스/리포지토리)
├─ types/         # Hono Variables 등 타입
└─ utils/         # id/password/pdf/r2/session 등 유틸
```

**모듈 구조/컨벤션(현 코드 기준)**

- 모듈 위치: `apps/api/src/modules/[module]/`
- 기본 레이어: **Routes → Services → Repositories**
- **CQRS**: 읽기(Query)/쓰기(Command) 서비스 분리 (예: `*-query.service.ts`, `*-command.service.ts`)
- Route는 얇게: `@repo/api-spec`의 `createRoute`를 가져와 `openapi(route, handler)`로 핸들러만 주입.
- DB 접근은 repository로만: 서비스에서 직접 Drizzle 쿼리 금지(패턴상).
- 트랜잭션: `runInTransaction` 헬퍼로 경계 관리.
- 인증 컨텍스트: `authMiddleware`가 `c.set("auth", ...)` 주입, `extractAuthContext`로 userId/sessionId를 추출.
- 에러: 모듈별 `errors.ts`에서 `BaseError`를 상속한 에러 팩토리 제공 + 글로벌 핸들러가 JSON 표준화.

**현재 modules 목록**

- `auth`: 이메일/패스워드 로그인, 세션 쿠키 처리(현 구현). (※ docs v2는 OAuth + 매직링크 중심)
- `learning-plan`: 계획/모듈/태스크 CRUD(현 구현의 핵심 도메인).
- `progress`: 일별 진행 집계.
- `documents`: PDF 업로드(R2) + DB 저장.
- `ai`: 계획/노트/퀴즈 등 생성 기능(현 구현).
- `ai-chat`: AI 대화/스트리밍(tool calling) 기능(현 구현).

### `apps/web` (프론트엔드)

**기술**: React Router v7 + Vite, Tailwind v4, `@repo/ui` 사용.

**구조**

- `apps/web/app/`이 애플리케이션 루트(React Router 파일 기반 라우팅 구성: `apps/web/app/routes.ts`).
- `features/`에 화면/도메인 단위 UI + view-model/hooks 배치.
- `mock/`에 로컬 상태 기반 “API 모킹”이 존재하며, 현재 흐름은 실 API 호출보다 mock 중심임.

### `apps/storybook`

`@repo/ui` 컴포넌트 개발/문서화 환경. 스토리는 `@repo/ui`를 import하여 사용(로컬 재구현 금지).

## Packages

### `packages/api-spec` (API 계약 / OpenAPI)

**역할**: Zod 스키마 + `createRoute` 정의로 **단일 진실의 원천(SSoT)** 역할. OpenAPI 문서 생성 스크립트 포함.

**구조**

```
packages/api-spec/src/
├─ common/          # 공통 schema (에러 응답 등)
├─ modules/         # 도메인별 schema/routes
├─ openapi.ts       # Registry 구성 + OpenAPI 문서 생성
└─ scripts/         # openapi.json 생성 스크립트
```

**중요 컨벤션**

- Protected route는 `security: [{ cookieAuth: [] }]`를 추가.
- 모든 route는 `default` 에러 응답을 포함.

### `packages/database` (DB 스키마/클라이언트)

**역할**: Drizzle ORM 스키마, 타입 export, Neon serverless 기반 DB client 생성.

**구조**

```
packages/database/
├─ src/schema.ts     # 전체 스키마(단일 파일)
├─ src/client.ts     # createDb()
├─ src/types.ts      # inferred 타입 export
└─ migrations/       # drizzle-kit 생성 산출물(직접 수정 금지)
```

### `packages/ai-types`

AI 관련 **타입/스키마만** 공유(실행 로직은 `apps/api`에 존재).

### `packages/ui`

공유 React UI 컴포넌트 라이브러리(Storybook에서 사용).

### `packages/config`

공유 ESLint/Prettier/tsconfig preset 제공.

## Docs (`docs/`)

제품/디자인/엔지니어링 문서가 분리되어 있고, 특히 `docs/04-engineering/`에 **v2 기준의 API/데이터 모델/백엔드 설계 문서**가 존재합니다.

- `docs/04-engineering/api/*`: API 규약/엔드포인트 스펙(예: `/api/materials`, `/api/plans`).
- `docs/04-engineering/backend/*`: ingestion/RAG/session 엔진 등 구현 규칙.
- `docs/04-engineering/data-models.md`: v2 데이터 모델(Spaces/Materials/Plans/Sessions/Chat 등).

## 코딩/아키텍처 컨벤션(요약)

- **TypeScript strict**, `any` 금지, `@repo/config` tsconfig preset 사용.
- **ESLint v9 flat config** + import 정렬 + 미사용 식별자 검사.
- **Prettier**: 2-space, 80 columns, trailing commas.
- **백엔드 레이어링**: Routes는 얇게(검증→서비스 호출), Services가 규칙의 단일 소스, DB는 repository 경유, 트랜잭션 경계 명확히.

## 주의: docs(v2) vs 현재 구현(v1) 불일치

현 `apps/api`의 도메인/경로/인증/AI 스택은 `docs/04-engineering/`이 전제하는 v2 구조와 차이가 있습니다.

- docs는 `Materials/Plans/Sessions/Chat` 중심 경로를 사용.
- 현 구현은 `learning-plan`, `documents`, `ai`, `ai-chat` 등 모듈 중심 + 경로 구조가 상이.

이 문서는 **“현재 상태의 지도”**로 유지하고, v2 구현 단계에서 docs 스펙에 맞춰 재정렬합니다.
