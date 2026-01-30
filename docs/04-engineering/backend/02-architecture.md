# Backend Architecture

## 개요

Hono.js + TypeScript 기반 **레이어드 아키텍처**. API 서버와 비즈니스 로직의 물리적 분리가 핵심 설계 결정입니다.

## 설계 결정

### 1. API / Core Separation

**결정**: HTTP 관심사와 비즈니스 로직을 완전히 분리

```
┌─────────────────────────────────────┐
│  apps/api (HTTP Layer)              │
│  - Request/Response handling        │
│  - Middleware (auth, logging, etc)  │
│  - Cookie/Header management         │
│  - Route registration               │
└──────────────┬──────────────────────┘
               │ Result<T, Error>
               ▼
┌─────────────────────────────────────┐
│  packages/core (Business Layer)     │
│  - Domain logic                     │
│  - Use cases                        │
│  - Port/Adapter pattern             │
│  - External integrations            │
└─────────────────────────────────────┘
```

**근거**:

- **테스트 용이성**: Core는 HTTP 없이 단위 테스트 가능
- **재사용성**: 동일 로직을 다른 인터페이스로 노출 가능 (CLI, Queue Worker 등)
- **관심사 분리**: HTTP 세부사항이 도메인 오염 방지

### 2. Functional DI over IoC Container

**결정**: 클래스 기반 DI 컨테이너 대신 함수형 DI

```typescript
// apps/api/src/app-deps.ts
export type AppDeps = {
  readonly config: Config;
  readonly logger: Logger;
  readonly services: AppServices;
};
```

**근거**:

- TypeScript 타입 시스템과 자연스러운 통합
- 런타임 오버헤드 없음
- 테스트시 mock 주입이 단순함
- IDE 자동완성 지원

### 3. Clean Architecture in Core

**결정**: Core 내부에서 Hexagonal Architecture 적용

```
Core Module Structure:

api/                       # 외부 인터페이스
├── index.ts               # Service facade (진입점)
├── ports.ts               # 출력 포트 (driven adapters 인터페이스)
└── schema.ts              # 입력 검증 (Zod)

internal/
├── domain/                # 순수 비즈니스 로직
│   ├── types.ts
│   └── utils.ts
├── application/           # 유스케이스 (use case per file)
│   └── *.ts
└── infrastructure/        # 어댑터 구현
    ├── *.repository.ts    # DB 접근
    └── adapters/
        └── *.adapter.ts   # 외부 서비스 연동
```

**근거**:

- **테스트 가능성**: 외부 의존성을 인터페이스로 교체 가능
- **기술 선택 유연성**: Repository 구현 교체 가능
- **비즈니스 로직 보호**: 외부 기술 변화가 도메인에 영향 주지 않음

## 요청 흐름

```
Request
  │
  ▼
┌─────────────────────────────────────────┐
│ 1. Middleware Chain                     │
│   - requestId (고유 ID 생성)            │
│   - logger (요청 로깅)                  │
│   - secureHeaders (CSP, 보안 헤더)      │
│   - bodyLimit (256KB 제한)              │
│   - csrf (/api/*에서만)                 │
│   - rateLimit (IP 기반 제한)            │
│   - cors (FRONTEND_URL만 허용)          │
└─────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────┐
│ 2. Route Handler                        │
│   - Zod validation (@hono/zod-openapi)  │
│   - Auth middleware (선택적)            │
│   - Core Service 호출                   │
│   - Result handling                     │
└─────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────┐
│ 3. Core Service                         │
│   - Business logic                      │
│   - Port calls (repository, adapter)    │
│   - Result<Ok, Error> 반환              │
└─────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────┐
│ 4. Response                             │
│   - JSON serialization                  │
│   - Cookie operations                   │
│   - Error handling (onError)            │
└─────────────────────────────────────────┘
```

## 핵심 컴포넌트

### App Factory ([app.ts](../../../apps/api/src/app.ts))

미들웨어 등록 순서가 **보안과 기능에 결정적 영향**:

1. `requestId` - 모든 로그에 requestId 연결
2. `logger` - 요청 로깅 (requestId 필요)
3. `secureHeaders` - CSP 및 보안 헤더
4. `bodyLimit` - 256KB 제한 (DoS 방어)
5. `csrf` - /api/\* 경로에서만 적용
6. `rateLimit` - csrf 이후 (리소스 보호)
7. `cors` - preflight 처리

### Route Registration ([routes/index.ts](../../../apps/api/src/routes/index.ts))

모든 라우트는 `/api` prefix 하에 통합:

```
/health              # Health check
/openapi.json        # OpenAPI spec
/docs                # Scalar API documentation
/api/auth/*          # Authentication
/api/materials/*     # Learning materials
/api/plans/*         # Learning plans
/api/sessions/*      # Learning sessions
```

### Result Handling ([result-handler.ts](../../../apps/api/src/lib/result-handler.ts))

Core의 `Result` 타입을 HTTP 응답으로 변환하는 일관된 패턴:

```typescript
// 성공 시
return handleResult(result, (data) => c.json({ data }, 200));

// 단순 성공
return jsonResult(c, result, 200);
```

## 인프라 연동

### Queue System (BullMQ)

**위치**:

- BullMQ 어댑터(Queue/Worker 래퍼): [`packages/queue-bullmq/`](../../../packages/queue-bullmq/)
- Worker 런타임(프로세스/부팅/Graceful shutdown): [`apps/worker/`](../../../apps/worker/)

비동기 작업 처리:

- **Plan Generation**: AI 기반 학습 계획 생성
- **Material Processing**: 파일 업로드 및 텍스트 추출

### 외부 서비스

**Configuration** ([lib/config.ts](../../../apps/api/src/lib/config.ts)):

모든 외부 연동은 환경 변수로 설정되며 Zod로 검증:

- **Database**: Prisma + PostgreSQL
- **Redis**: BullMQ + Upstash
- **Storage**: Cloudflare R2
- **AI**: Google Gemini API
- **Email**: Resend
- **OAuth**: Google OAuth 2.0

## 설계 트레이드오프

| 결정           | 장점                | 단점                |
| -------------- | ------------------- | ------------------- |
| Functional DI  | 타입 안전, 단순함   | 수동 의존성 전달    |
| Result Pattern | 명시적 에러 처리    | 보일러플레이트 증가 |
| Core/API 분리  | 테스트 용이, 재사용 | 코드 탐색 복잡성    |
| OpenAPI/Zod    | 타입-스펙 동기화    | 추가 학습 필요      |

## 참고 문서

- [Project Structure](./02-project-structure.md) - 디렉토리 구조 상세
- [Error Handling](./02-error-handling.md) - 에러 처리 전략
- [API Conventions](./04-api-conventions.md) - API 설계 규칙
- [packages/core](../../../packages/core/) - Core 모듈 상세
