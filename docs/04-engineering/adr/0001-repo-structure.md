# ADR 0001: 레포지토리 구조

## 상태

**확정** (2025-12)

---

## 컨텍스트

Learning OS 프로젝트는 프론트엔드, 백엔드, 공통 스키마, 데이터베이스 등 여러 패키지로 구성됩니다. 개발 효율성과 코드 재사용을 위한 레포지토리 구조 결정이 필요합니다.

---

## 결정

**모노레포(Monorepo)** 구조를 채택합니다.

### 디렉토리 구조

```
learning-os/
├── apps/
│   ├── web/              # React 프론트엔드
│   └── api/              # HonoJS 백엔드
├── packages/
│   ├── database/         # Drizzle 스키마, 마이그레이션
│   ├── shared/           # 공통 타입, 유틸리티
│   └── ai/               # AI 파이프라인 (LangChain)
├── docs/                 # 프로젝트 문서
│   ├── 01-overview/
│   ├── 02-design/
│   ├── 03-product/
│   └── 04-engineering/
├── .github/              # CI/CD 설정
├── turbo.json            # Turborepo 설정
├── pnpm-workspace.yaml   # pnpm 워크스페이스
└── package.json
```

---

## 근거

### 모노레포 선택 이유

1. **타입 공유**: 프론트-백 간 타입 정의를 `packages/shared`에서 단일 소스로 관리
2. **일관된 버전**: 모든 패키지가 동일한 의존성 버전 사용
3. **원자적 변경**: 스키마 변경 시 프론트-백 동시 수정 가능
4. **개발 편의**: 단일 클론으로 전체 개발 환경 구축

### 대안 검토

| 옵션         | 장점                   | 단점               | 결과     |
| ------------ | ---------------------- | ------------------ | -------- |
| **모노레포** | 타입 공유 용이, 일관성 | 복잡한 CI 설정     | **채택** |
| 멀티레포     | 독립적 배포            | 버전 동기화 어려움 | 기각     |

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

### 대응 규칙

| 문서 위치                         | 코드 위치                        | 예시          |
| --------------------------------- | -------------------------------- | ------------- |
| `03-product/pages/home.md`        | `apps/web/src/pages/home/`       | Home 페이지   |
| `04-engineering/api/materials.md` | `apps/api/src/routes/materials/` | Materials API |
| `04-engineering/data-models.md`   | `packages/database/schema.ts`    | DB 스키마     |

### 명명 규칙

1. **파일명**: kebab-case (예: `plan-detail.md`, `plan-detail.tsx`)
2. **컴포넌트**: PascalCase (예: `PlanDetail`)
3. **API 경로**: kebab-case (예: `/plan-sessions`)
4. **DB 테이블**: snake_case (예: `plan_sessions`)

---

## 결과

### 긍정적

- Zod 스키마를 프론트-백에서 직접 import 가능
- 타입 불일치 버그 감소
- 문서-코드 간 추적 용이

### 부정적

- CI/CD 설정 복잡도 증가
- 빌드 시간 증가 가능 (Turborepo로 완화)

---

## 관련 문서

- [기술 스택](../tech-stack.md)
- [시스템 아키텍처](../architecture.md)
