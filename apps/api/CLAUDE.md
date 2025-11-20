# apps/api

Hono.js 백엔드 API - Drizzle ORM, Neon DB, AI 통합

## Purpose

- RESTful API 제공 (OpenAPI 기반)
- Cookie 기반 인증
- AI 채팅 및 컨텐츠 생성
- 파일 스토리지 (R2/S3)

## Tech Stack

- **Framework**: Hono.js + @hono/zod-openapi
- **Database**: Neon DB via Drizzle ORM
- **AI**: Vercel AI SDK + Google Gemini
- **Validation**: Zod (from @repo/api-spec)

## Architecture Patterns

### Layered Structure

```
Routes (HTTP) → Services (Business Logic) → Repositories (Data Access)
```

### CQRS Pattern

- **Command Services**: 쓰기 작업 (create, update, delete)
- **Query Services**: 읽기 작업 (list, get)
- 파일명: `[entity]-command.service.ts`, `[entity]-query.service.ts`

### Repository Pattern

- 모든 DB 접근은 repository를 통해
- 트랜잭션 지원: `tx` 파라미터 전달
- N+1 쿼리 방지 (leftJoin 활용)

## Module Structure

```
modules/[module-name]/
  ├── routes/         # HTTP 핸들러
  ├── services/       # 비즈니스 로직 (command + query)
  ├── repositories/   # DB 접근
  └── errors.ts       # 모듈 에러
```

## Key Modules

- **auth**: 인증/세션 관리
- **learning-plan**: 학습 계획/모듈/태스크 CRUD
- **ai-chat**: AI 채팅 (tool calling)
- **ai**: AI 노트/퀴즈 생성
- **progress**: 학습 진행률 추적
- **documents**: 파일 업로드/다운로드

## Important Rules

1. **Routes는 얇게** - 비즈니스 로직은 서비스에
2. **Services는 repository만 사용** - 직접 DB 접근 금지
3. **트랜잭션 필수** - 여러 테이블 수정 시 `runInTransaction` 사용
4. **에러는 타입별로** - BaseError 상속한 커스텀 에러 사용
5. **Authorization 체크** - 리소스 소유권 확인 (`ownership.helper`)

## Adding New Endpoint

1. @repo/api-spec에 스펙 정의
2. Repository 메서드 추가 (필요 시)
3. Service 로직 구현 (command/query 분리)
4. Route 핸들러 작성
5. app.ts에 라우트 등록

## AI Integration

- `streamText`로 스트리밍 응답
- Tool definitions은 @repo/ai-types에서 import
- Execute 함수만 이 앱에서 구현

## Design Notes

- Port 3000 (기본)
- API docs: `/reference` (Scalar UI)
- Pino 구조화 로깅
- Cookie-based auth (HttpOnly)
