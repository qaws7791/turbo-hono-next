# Backend Documentation

> Hono.js 기반 학습 로드맵 API 서버 설계 문서

## 목차

| 문서                                          | 목적            | 주요 결정사항                           |
| --------------------------------------------- | --------------- | --------------------------------------- |
| [01-architecture](./01-architecture.md)       | 시스템 아키텍처 | Layered architecture, Core/API 분리, DI |
| [02-error-handling](./02-error-handling.md)   | 에러 처리 전략  | Result 패턴, 에러 분류, HTTP 매핑       |
| [03-authentication](./03-authentication.md)   | 인증과 세션     | Cookie-based, OAuth+PKCE, Magic Link    |
| [04-api-conventions](./04-api-conventions.md) | API 설계 규칙   | OpenAPI-first, Zod 검증, 응답 형식      |
| [05-queue-system](./05-queue-system.md)       | 비동기 작업 큐  | BullMQ, Worker 패턴, Retry 정책         |
| [06-security](./06-security.md)               | 보안 정책       | CSP, CSRF, Rate limiting                |

## 빠른 참조

### 주요 파일 경로

```
apps/api/src/
├── app.ts              # App factory (미들웨어 체인)
├── app-deps.ts         # DI container 타입
├── routes/index.ts     # 라우트 등록
├── middleware/         # Hono 미들웨어
│   ├── auth.ts         # 인증/인가
│   ├── error-handler.ts
│   ├── rate-limit.ts
│   └── secure-headers.ts
└── lib/
    ├── config.ts       # 환경 설정
    └── result.ts       # Result 타입 확장

packages/core/src/modules/
├── auth/               # 인증 도메인
├── material/           # 학습 자료 도메인
├── plan/               # 학습 계획 도메인
├── session/            # 학습 세션 도메인
└── knowledge/          # RAG/지식 베이스
```

### 핵심 원칙

```
단순성 > 복잡성
명시적 > 암시적
타입 안전 > 편의성
테스트 용이성 > 개발 속도
```

### 보이지 않는 규칙

1. **Never throw directly** - 항상 `Result` 타입 사용
2. **Never use `any`** - TypeScript strict mode 준수
3. **Never bypass auth** - 인증 체크는 항상 명시적 미들웨어로
4. **Never trust input** - Zod 검증 필수
5. **Never block event loop** - 무거운 작업은 큐로 offload

## 아키텍처 개요

### 레이어 분리

```
┌─────────────────────────────────────┐
│  apps/api (HTTP Layer)              │
│  - Request/Response 처리            │
│  - Middleware (auth, logging, CORS) │
│  - Route 등록                       │
│  - Cookie/Header 관리               │
└──────────────┬──────────────────────┘
               │ Result<T, Error>
               ▼
┌─────────────────────────────────────┐
│  packages/core (Business Layer)     │
│  - Domain logic                     │
│  - Use cases                        │
│  - Port/Adapter 패턴                │
│  - 외부 연동 추상화                 │
└─────────────────────────────────────┘
```

### Core 내부 구조 (Clean Architecture)

```
modules/{domain}/
├── api/                    # 외부 인터페이스
│   ├── index.ts            # Service facade
│   ├── ports.ts            # 출력 포트 정의
│   └── schema.ts           # 입력 검증
└── internal/
    ├── domain/             # 순수 도메인 로직
    ├── application/        # 유스케이스
    └── infrastructure/     # 어댑터 구현
```

## 연관 문서

- [Root CLAUDE.md](../../../CLAUDE.md) - 프로젝트 전체 개요
- [packages/api-spec](../../../packages/api-spec/CLAUDE.md) - API 명세
- [packages/database](../../../packages/database/CLAUDE.md) - DB 스키마
- [packages/core](../../../packages/core/CLAUDE.md) - Core 모듈
