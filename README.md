# LOLOG

<div align="center">

**문서에서 시작해 나만의 학습 계획과 지식으로 완성하는 개발자 학습 로드맵**

LOLOG는 학습 자료를 구조화하고, 실행 가능한 계획과 세션을 만들며,<br />
학습 과정에서 얻은 핵심 개념을 다시 꺼내 볼 수 있게 연결합니다.

![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-339933?logo=nodedotjs&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-10.2.1-F69220?logo=pnpm&logoColor=white)
![Turborepo](https://img.shields.io/badge/Turborepo-2.x-EF4444?logo=turborepo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)

</div>

<p align="center">
  <img src="./docs/images/readme/today-and-plans.png" alt="LOLOG 오늘의 세션과 학습 계획 화면" width="100%" />
</p>

## 주요 기능

- **문서 기반 학습 설계** — 업로드한 자료를 바탕으로 목표와 수준에 맞는 학습 계획을 구성합니다.
- **오늘의 세션** — 지금 학습할 내용, 예상 시간, 진행률을 한 화면에서 확인하고 바로 시작합니다.
- **개념 라이브러리** — 학습 중 생성된 핵심 개념과 관련 개념을 모아 복습합니다.
- **AI 학습 흐름** — 세션의 순서와 복습 과정을 AI 튜터가 안내합니다.
- **반응형 경험** — 데스크톱과 모바일에서 같은 학습 흐름을 자연스럽게 이어갑니다.

## 화면 미리보기

### 학습 현황과 계획

<table>
  <tr>
    <td width="50%" align="center"><strong>오늘의 세션과 최근 활동</strong></td>
    <td width="50%" align="center"><strong>학습 계획 관리</strong></td>
  </tr>
  <tr>
    <td><img src="./docs/images/readme/dashboard.png" alt="오늘의 세션과 최근 활동 화면" /></td>
    <td><img src="./docs/images/readme/learning-plans.png" alt="학습 계획 목록 화면" /></td>
  </tr>
</table>

### 개념을 발견하고 다시 연결하기

<table>
  <tr>
    <td width="50%" align="center"><strong>개념 라이브러리</strong></td>
    <td width="50%" align="center"><strong>개념 상세와 복습</strong></td>
  </tr>
  <tr>
    <td><img src="./docs/images/readme/concepts.png" alt="개념 라이브러리 화면" /></td>
    <td><img src="./docs/images/readme/concept-detail.png" alt="상태 업데이트 함수형 패턴 개념 상세 화면" /></td>
  </tr>
</table>

### 모바일에서도 이어지는 학습

<p align="center">
  <img src="./docs/images/readme/mobile-learning-plans.png" alt="모바일 학습 계획 화면" width="340" />
</p>

## 기술 스택

| 영역 | 기술 |
| --- | --- |
| Web | React Router v7, React, Vite, TypeScript |
| API | Hono, OpenAPI, Zod |
| Data | PostgreSQL, pgvector, Drizzle ORM |
| Queue | BullMQ, Redis |
| AI / Storage | Gemini, OpenAI, Cloudflare R2 |
| UI | Shared UI package, Storybook |
| Monorepo | Turborepo, pnpm workspaces |

## 프로젝트 아키텍처

```mermaid
flowchart TD
  WEB["Web<br/>React Router + Vite"] --> API["API<br/>Hono + OpenAPI"]
  API --> DB[("PostgreSQL<br/>pgvector")]
  API --> REDIS[("Redis<br/>BullMQ")]
  WORKER["Worker"] --> REDIS
  WORKER --> DB
  API --> AI["Gemini / OpenAI"]
  API --> R2["Cloudflare R2"]
  UI["Shared UI"] --> WEB
  UI --> SB["Storybook"]
```

### 모노레포 구조

```text
apps/
├── api/          # Hono API, OpenAPI 문서, DB·AI·스토리지 연동
├── web/          # React Router + Vite SPA
├── worker/       # BullMQ 비동기 작업 처리
└── storybook/    # 공유 UI 컴포넌트 문서화

packages/
├── contracts/    # Zod 기반 API·도메인 계약(SSoT)
├── openapi/      # HTTP Route 정의와 OpenAPI 생성
├── database/     # Drizzle 스키마, 마이그레이션, DB 클라이언트
├── ui/           # 공유 UI 컴포넌트
└── config/       # ESLint, Prettier, TypeScript 공통 설정
```

더 자세한 내용은 [엔지니어링 아키텍처](./docs/04-engineering/02-architecture.md)와
[리포지토리 구조](./docs/04-engineering/04-repo-structure.md)를 참고하세요.

## 로컬 개발 시작하기

### 요구사항

- Node.js `>= 18`
- pnpm `10.2.1` — Corepack 사용 권장
- Docker와 Docker Compose
- PostgreSQL 16 + pgvector

### 1. 리포지토리 준비

```bash
git clone https://github.com/qaws7791/turbo-hono-next.git
cd turbo-hono-next

corepack enable
corepack prepare pnpm@10.2.1 --activate
pnpm install
```

### 2. Redis와 PostgreSQL 실행

BullMQ용 Redis와 RedisInsight를 실행합니다.

```bash
docker-compose up -d
docker-compose ps
```

PostgreSQL이 없다면 pgvector 이미지로 실행할 수 있습니다.

```bash
docker run --name lolog-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=lolog \
  -p 5432:5432 \
  -d pgvector/pgvector:pg16

docker exec -it lolog-postgres \
  psql -U postgres -d lolog \
  -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

로컬 인프라 접속 정보:

| 서비스 | 주소 | 비고 |
| --- | --- | --- |
| PostgreSQL | `localhost:5432` | DB: `lolog`, 사용자: `postgres` |
| Redis | `localhost:6379` | BullMQ 작업 큐 |
| RedisInsight | <http://localhost:5540> | Host: `redis`, Port: `6379` |

### 3. 환경 변수 설정

```bash
cp apps/api/.env.example apps/api/.env
cp apps/worker/.env.example apps/worker/.env
```

최소한 API의 `DATABASE_URL`을 로컬 환경에 맞게 설정합니다.

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lolog
REDIS_URL=redis://127.0.0.1:6379
FRONTEND_URL=http://localhost:5173
```

OAuth, 이메일, R2, AI 모델을 포함한 전체 변수는
[환경 변수 문서](./docs/01-ENVIRONMENT.md)에서 확인할 수 있습니다.

### 4. DB 마이그레이션과 개발 서버 실행

```bash
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/lolog"
pnpm --filter @repo/database db:migrate

pnpm dev
```

기본 접속 주소:

| 서비스 | URL |
| --- | --- |
| Web | <http://localhost:5173> |
| API | <http://localhost:3001> |
| OpenAPI JSON | <http://localhost:3001/openapi.json> |
| API Docs | <http://localhost:3001/docs> |
| Storybook | <http://localhost:6006> |

개별 앱만 실행할 수도 있습니다.

```bash
pnpm --filter web dev
pnpm --filter api dev
pnpm --filter worker dev
pnpm --filter storybook dev
```

## 개발 명령

```bash
pnpm dev        # 전체 개발 서버
pnpm build      # 전체 빌드
pnpm lint       # 린트
pnpm lint:fix   # 린트 자동 수정
pnpm typecheck  # 타입 검사
pnpm format     # Prettier 포맷
```

### Database

`packages/database/migrations/*`는 Drizzle Kit이 생성하는 산출물입니다. 직접 수정하지 않습니다.

```bash
pnpm --filter @repo/database db:generate
pnpm --filter @repo/database db:push
pnpm --filter @repo/database db:migrate
pnpm --filter @repo/database db:pull
```

### API First 워크플로우

- API·도메인 계약은 `packages/contracts/src/**`를 단일 진실의 원천으로 관리합니다.
- API 구현은 `@repo/openapi`의 route를 가져와 핸들러를 주입합니다.
- OpenAPI 산출물은 아래 명령으로 생성합니다.

```bash
pnpm --filter @repo/openapi generate:openapi
```

## 문서

- [문서 인덱스](./docs/README.md)
- [제품 비전](./docs/01-overview/01-vision.md)
- [제품 사용자 흐름](./docs/02-product/02-user-flow.md)
- [엔지니어링 개요](./docs/04-engineering/01-overview.md)
- [테스트 가이드](./docs/02-TESTING.md)

## 커밋 컨벤션

[Conventional Commits](https://www.conventionalcommits.org/)를 사용합니다.

```text
feat: add new feature
fix: resolve an issue
docs: improve documentation
```

지원 타입: `build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`,
`revert`, `style`, `test`
