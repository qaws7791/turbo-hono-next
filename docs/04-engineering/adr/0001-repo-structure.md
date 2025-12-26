# ADR 0001: 레포지토리 구조

## 상태

**확정** (2025-12)

---

## 컨텍스트

Learning OS 프로젝트는 프론트엔드, 백엔드, 공통 타입/스키마, UI 패키지 등 여러 워크스페이스로 구성됩니다. 개발 효율성과 코드 재사용을 위해 레포 구조와 “문서-코드 대응 원칙”을 고정할 필요가 있습니다.

---

## 결정

**Turborepo + pnpm workspaces 기반 모노레포** 구조를 채택합니다.

### 디렉토리 구조(요약)

```
turbo-local-market/
├── apps/
│   ├── web/              # React Router v7 프론트엔드
│   ├── api/              # Hono.js 백엔드
│   └── storybook/        # UI/컴포넌트 개발 환경
├── packages/
│   ├── ui/               # 공유 UI 컴포넌트
│   ├── api-spec/         # API 명세/스키마
│   ├── database/         # DB 스키마/클라이언트
│   ├── ai-types/         # AI 관련 공유 타입
│   ├── config/           # 공용 설정
│   ├── eslint-config/    # ESLint 설정
│   └── typescript-config/# TS 설정
└── docs/                 # 프로젝트 문서(01~04)
```

---

## 근거

### 모노레포 선택 이유

1. **타입/스키마 공유**: API/DB/AI 타입을 패키지로 분리해 단일 출처로 관리
2. **원자적 변경**: 스키마 변경 시 프론트-백 동시 수정 가능
3. **개발 편의**: 단일 설치/단일 실행으로 전체 개발 환경 구성
4. **일관된 품질**: 공용 lint/tsconfig를 워크스페이스로 통일

---

## 문서-코드 대응 원칙

### 문서 구조

```
docs/
├── 01-overview/     # 비전, 원칙, 용어집
├── 02-design/       # 디자인 시스템
├── 03-product/      # 제품 기능, 페이지
└── 04-engineering/  # 기술 구현
```

### 대응 규칙(예시)

| 문서 위치                              | 코드 위치(대표)                       | 비고             |
| -------------------------------------- | ------------------------------------- | ---------------- |
| `docs/03-product/pages/home.md`        | `apps/web/app/routes/home.tsx`        | Home 라우트      |
| `docs/03-product/pages/plan-detail.md` | `apps/web/app/routes/plan-detail.tsx` | Plan 상세 라우트 |
| `docs/04-engineering/frontend/*.md`    | `apps/web/app/**`                     | 프론트 구현      |
| `docs/04-engineering/api/*.md`         | `apps/api/**`, `packages/api-spec/**` | API 구현/명세    |
| `docs/04-engineering/data-models.md`   | `packages/database/**`                | DB 스키마        |

---

## 명명 규칙

1. **파일명**: kebab-case (예: `plan-detail.md`, `plan-detail.tsx`)
2. **컴포넌트**: PascalCase (예: `PlanDetailView`)
3. **라우트 경로**: kebab-case/리소스 기반(예: `/spaces/:spaceId/plan/:planId`)

---

## 결과

### 긍정적

- 워크스페이스 기반 공유로 타입 불일치 버그 감소
- 문서와 코드 간 추적이 쉬워짐

### 부정적

- CI/CD와 캐시 설정 복잡도 증가
- 빌드 시간 증가 가능(터보 캐시로 완화)

---

## 관련 문서

- [기술 스택](../tech-stack.md)
- [시스템 아키텍처](../architecture.md)
