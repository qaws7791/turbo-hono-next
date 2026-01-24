# CLAUDE.md

AI 에이전트가 이 저장소의 코드를 작업할 때 참고하는 가이드

## Project Overview

개발자를 위한 **학습 로드맵 서비스** - AI 기반 맞춤형 학습 경로, 목표 추적, 학습 이력 통합을 제공하는 **Turborepo 모노레포** (pnpm workspaces)

**타겟 사용자**: 구조화된 학습 경로가 필요한 주니어 개발자와 커리어 전환자, 새로운 기술 스택을 배우는 시니어 개발자

## Monorepo Structure

### Applications

- **`apps/api`**: Hono.js 백엔드 API ([상세 문서](./apps/api/CLAUDE.md))
- **`apps/web`**: Vite + React 프론트엔드 ([상세 문서](./apps/web/CLAUDE.md))
- **`apps/storybook`**: 컴포넌트 개발 환경 ([상세 문서](./apps/storybook/CLAUDE.md))

### Packages

- **`packages/ai-types`**: AI SDK 공유 타입 ([상세 문서](./packages/ai-types/CLAUDE.md))
- **`packages/api-spec`**: API 명세 정의 ([상세 문서](./packages/api-spec/CLAUDE.md))
- **`packages/database`**: 데이터베이스 스키마 및 클라이언트 ([상세 문서](./packages/database/CLAUDE.md))
- **`packages/ui`**: 공유 React 컴포넌트 ([상세 문서](./packages/ui/CLAUDE.md))
- **`packages/config`**: 공유 설정 ([상세 문서](./packages/config/CLAUDE.md))

## Key Commands

```bash
# 의존성 설치
pnpm install

# 로컬 인프라 시작 (Redis + RedisInsight)
docker-compose up -d      # 시작
docker-compose ps         # 상태 확인
docker-compose down       # 중지
docker-compose down -v    # 중지 + 데이터 삭제

# 모든 개발 서버 시작 (API, web, storybook)
pnpm dev

# 특정 워크스페이스만 시작
pnpm --filter web dev
pnpm --filter api dev
pnpm --filter storybook dev

# 코드 품질
pnpm lint          # 린트 검사
pnpm lint:fix      # 린트 자동 수정
pnpm typecheck   # 타입 체크
pnpm format        # 포맷팅

# 빌드 및 배포
pnpm build         # 전체 빌드
pnpm deploy        # 배포 (AWS credentials 필요)
pnpm deploy:api    # API만 배포
```

## Local Infrastructure (Docker Compose)

루트 `docker-compose.yml`로 로컬 개발 인프라를 관리합니다.

| 서비스           | 포트   | 용도                                |
| ---------------- | ------ | ----------------------------------- |
| **redis**        | `6379` | BullMQ 작업 큐                      |
| **redisinsight** | `5540` | Redis 웹 UI (http://localhost:5540) |

**RedisInsight 연결 설정**: Host `redis`, Port `6379`

## Development Guidelines

### Coding Standards

- **TypeScript**: Strict mode, `any` 금지, 명시적 return 타입
- **Formatting**: Prettier - 2-space indent, 80자 제한, trailing commas
- **Linting**: ESLint v9 flat config, import 정렬, 미사용 식별자 체크
- **Naming**:
  - 타입 파라미터: `TUser`
  - Hooks: `useAuth`
  - 파일: kebab-case (모듈), PascalCase (컴포넌트)

### Design Principles

- **단순성**: 가장 단순한 구현 선택
- **단일 책임**: 함수/클래스당 하나의 책임
- **DRY**: 중복 제거 (공유 헬퍼 사용)
- **YAGNI**: 필요 전까지 기능 구현 금지
- **불변성**: 항상 `const` 사용, 부작용 회피
- **방어적 프로그래밍**: Zod로 모든 입력 검증
- **타입 안전성**: TypeScript 고급 기능 활용

## Commit Conventions

**Conventional Commits** 준수 (`@commitlint/config-conventional`):

```bash
feat: 학습 계획 기능 추가
fix: 인증 쿠키 이슈 해결
chore: 의존성 업데이트
```

**Valid types**: `build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`, `revert`, `style`, `test`

## Common Workflows

상세 워크플로우는 패키지별 CLAUDE.md 참조:

- **API 엔드포인트 추가**: [packages/api-spec/CLAUDE.md](./packages/api-spec/CLAUDE.md)
- **DB 스키마 수정**: [packages/database/CLAUDE.md](./packages/database/CLAUDE.md)
- **새 기능 추가**: [apps/api/CLAUDE.md](./apps/api/CLAUDE.md), [apps/web/CLAUDE.md](./apps/web/CLAUDE.md)
- **UI 컴포넌트 수정**: [packages/ui/CLAUDE.md](./packages/ui/CLAUDE.md)

## Environment Variables

주요 환경 변수 (`turbo.json` 참조):

- **Database**: `DATABASE_URL`
- **Session**: `SESSION_COOKIE_NAME`, `SESSION_DURATION_DAYS`, `COOKIE_SECURE`, `COOKIE_DOMAIN`
- **OAuth**: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- **Email**: `EMAIL_DELIVERY_MODE`, `RESEND_API_KEY`, `RESEND_EMAIL`
- **File Storage**: `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_ENDPOINT`, `R2_PUBLIC_URL`
- **AI**: `OPENAI_API_KEY`, `OPENAI_SESSION_MODEL`, `GEMINI_API_KEY`, `GEMINI_CHAT_MODEL`, `GEMINI_EMBEDDING_MODEL`
- **Server**: `PORT`, `NODE_ENV`, `SERVICE_NAME`, `BASE_URL`, `FRONTEND_URL`
- **Web**: `VITE_API_BASE_URL`

## Reference Resources

`README.md`에서 베스트 프랙티스 및 가이드 링크 참조
