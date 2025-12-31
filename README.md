# LOLOG (turbo-local-market)

개발자를 위한 **학습 로드맵 서비스**입니다. Turborepo 모노레포(pnpm workspaces)로
구성되어 있으며 `apps/api`(Hono) + `apps/web`(React Router + Vite) +
`apps/storybook`(UI 컴포넌트)로 개발합니다.

## 시작하기 (로컬 개발)

### 요구사항

- Node.js `>= 18`
- pnpm `10.2.1` (Corepack 권장)
- PostgreSQL (로컬 Docker 또는 외부 DB)

### 1) 리포지토리 클론

```bash
git clone <YOUR_REPO_URL>
cd turbo-local-market
```

### 2) 패키지 매니저 준비

```bash
corepack enable
corepack prepare pnpm@10.2.1 --activate
```

### 3) 의존성 설치

```bash
pnpm install
```

### 4) PostgreSQL 프로비저닝

로컬에 PostgreSQL이 없다면 Docker로 빠르게 띄울 수 있습니다.

```bash
docker run --name lolog-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=lolog \
  -p 5432:5432 \
  -d postgres:16
```

이후 `DATABASE_URL`은 아래 형식으로 설정합니다.

```text
postgresql://postgres:postgres@localhost:5432/lolog
```

### 5) API 환경 변수 설정

`apps/api`는 `dotenv`를 사용하므로 `apps/api/.env`를 생성합니다.
`.env`는 Git에 커밋하지 마세요(시크릿 포함).

`apps/api/.env` 예시:

```env
NODE_ENV=development
SERVICE_NAME=LOLOG
PORT=3001

# API 서버 URL(자기 자신)
BASE_URL=http://localhost:3001

# CORS 허용 프론트엔드 Origin (web dev 서버 포트에 맞춰 수정)
FRONTEND_URL=http://localhost:5173

# Database (필수)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lolog

# Cookie/Session
SESSION_COOKIE_NAME=session
SESSION_DURATION_DAYS=7
COOKIE_DOMAIN=localhost
COOKIE_SECURE=false

# (선택) OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# (선택) Email
# 개발환경은 기본적으로 전송하지 않고 로그로만 남깁니다.
# 실제 전송 테스트가 필요하면 `EMAIL_DELIVERY_MODE=resend`로 설정하세요.
EMAIL_DELIVERY_MODE=log
RESEND_API_KEY=
RESEND_EMAIL=

# (선택) File Storage (Cloudflare R2)
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_ENDPOINT=
R2_PUBLIC_URL=

# (선택) AI
OPENAI_API_KEY=
OPENAI_CHAT_MODEL=gpt-4o-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
```

추가 환경 변수 참고:

- `apps/api/src/lib/config.ts` (런타임 검증 스키마)
- `turbo.json` (Turborepo global env)
- `docs/ENVIRONMENT.md` (변수 목록; 실제 구현과 일부 다를 수 있음)

### 6) DB 마이그레이션 (권장)

DB를 준비했다면 마이그레이션을 적용합니다.

```bash
# macOS/Linux
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/lolog"
pnpm --filter @repo/database db:migrate

# Windows PowerShell
$env:DATABASE_URL="postgresql://postgres:postgres@localhost:5432/lolog"
pnpm --filter @repo/database db:migrate
```

### 7) 개발 서버 실행

```bash
pnpm dev
```

기본 접속:

- Web: `http://localhost:5173` (실제 포트는 콘솔 로그 기준)
- API: `http://localhost:3001`
  - OpenAPI JSON: `http://localhost:3001/openapi.json`
  - API Docs(Scalar): `http://localhost:3001/docs`
- Storybook: `http://localhost:6006`

개별 실행:

```bash
pnpm --filter web dev
pnpm --filter api dev
pnpm --filter storybook dev
```

## 모노레포 구조

자세한 스냅샷/설명은 `docs/04-engineering/repo-structure.md`를 참고하세요.

- `apps/api`: Hono 기반 백엔드(API, OpenAPI 문서, DB/AI/스토리지 연동)
- `apps/web`: React Router v7 + Vite 프론트엔드(현재 `ssr: false` SPA 모드)
- `apps/storybook`: `@repo/ui` 컴포넌트 개발/문서화
- `packages/api-spec`: Zod 기반 API 계약(SSoT) + OpenAPI 생성
- `packages/database`: Drizzle 스키마/마이그레이션 + DB 클라이언트
- `packages/ui`: 공유 UI 컴포넌트 라이브러리
- `packages/config`: ESLint/Prettier/TSConfig 공유 설정

## 자주 쓰는 명령

```bash
pnpm dev
pnpm build

pnpm lint
pnpm lint:fix
pnpm check-types
pnpm format
```

DB 관련(`packages/database`):

```bash
pnpm --filter @repo/database db:generate
pnpm --filter @repo/database db:push
pnpm --filter @repo/database db:migrate
pnpm --filter @repo/database db:pull
```

## API First (권장 워크플로우)

- API 스펙은 `@repo/api-spec`(`packages/api-spec/src/modules`)을 단일 진실의 원천으로
  관리합니다.
- API 구현(`apps/api`)에서는 스펙에서 export한 route/schema를 가져와 핸들러만
  주입하는 방식으로 동기화합니다.
- OpenAPI 산출물이 필요하면 아래를 실행합니다.

```bash
pnpm --filter @repo/api-spec docs:generate
```

## 커밋 컨벤션

Conventional Commits를 사용합니다. 예: `feat: add new feature`

지원 타입: `build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`,
`revert`, `style`, `test`
