# 프론트엔드 모듈 4-레이어 구조 마이그레이션 계획

## 📋 개요

### 목표

현재 단순 파일 나열 방식의 모듈 구조를 **4-레이어 아키텍처**로 재구성하여 코드의 응집도를 높이고 의존성 방향을 명확히 합니다.

### 타겟 구조

```
modules/{module-name}/
├── api/                 # 🌐 외부 통신 레이어
├── application/         # ⚛️ React 앱 레이어
├── domain/              # 🏢 비즈니스 로직 레이어
├── ui/                  # 🎨 렌더링 레이어
└── index.ts             # 📦 모듈 Public API
```

### 레이어별 역할

| 레이어          | 역할                     | 포함 파일                                           | 의존 가능               |
| --------------- | ------------------------ | --------------------------------------------------- | ----------------------- |
| **domain**      | 순수 비즈니스 로직, 타입 | `types.ts`, `policy.ts`, `utils.ts`                 | 없음 (독립적)           |
| **api**         | 외부 API 호출            | `functions.ts`, `schema.ts`                         | `domain` (타입만)       |
| **application** | React 상태 관리, 훅      | `keys.ts`, `queries.ts`, `mutations.ts`, `flows.ts` | `api`, `domain`         |
| **ui**          | React 컴포넌트, 뷰       | `components/`, `views/`                             | `application`, `domain` |

---

## 📊 현재 모듈 현황 분석

### 모듈별 파일 매핑 (현재 → 타겟)

| 현재 파일            | 타겟 레이어 | 타겟 경로                              |
| -------------------- | ----------- | -------------------------------------- |
| `types.ts`           | domain      | `domain/types.ts`                      |
| `policy.ts`          | domain      | `domain/policy.ts`                     |
| `utils.ts`, `utils/` | domain      | `domain/utils.ts` 또는 `domain/utils/` |
| `api.ts`             | api         | `api/functions.ts`                     |
| `api-schema.ts`      | api         | `api/schema.ts`                        |
| `keys.ts`            | application | `application/keys.ts`                  |
| `queries.ts`         | application | `application/queries.ts`               |
| `mutations.ts`       | application | `application/mutations.ts`             |
| `flows.ts`           | application | `application/flows.ts`                 |
| `hooks.ts`           | -           | 삭제 (re-export 파일)                  |
| `components/`        | ui          | `ui/components/`                       |
| `views/`             | ui          | `ui/views/`                            |
| `map.ts` (materials) | domain      | `domain/map.ts`                        |

### 모듈별 복잡도 분류

#### 🟢 Simple (UI Only) - views만 있는 모듈

- `landing` - views만 존재
- `settings` - components만 존재

#### 🟡 Medium - 일부 레이어만 필요

- `today` - policy, views
- `documents` - utils, views
- `home` - api, keys, policy, queries, types, views
- `jobs` - api, keys, policy, queries, types
- `session-runs` - api, flows, mutations, types

#### 🔴 Full - 모든 레이어 필요

- `plans` - 전체 레이어 (api, keys, mutations, policy, queries, types, flows, components, views, utils)
- `spaces` - 전체 레이어 (api, keys, mutations, queries, types, flows, components, views)
- `materials` - 전체 레이어 (api, keys, mutations, policy, queries, types, flows, map)
- `auth` - 전체 레이어 (api, keys, mutations, queries, types, flows, utils, views)
- `app-shell` - 특수 모듈 (components, hooks, types)

#### ⚪ Infrastructure - 인프라 모듈 (마이그레이션 제외)

- `api` - 공통 API 클라이언트
- `query` - TanStack Query Provider

---

## 🚀 마이그레이션 계획

### Phase 1: 파일럿 모듈 (1개)

**목표**: 마이그레이션 패턴 검증 및 문제점 발견

- [ ] **Milestone 1.1**: `plans` 모듈 마이그레이션
  - 가장 복잡한 모듈로 모든 레이어 패턴 검증
  - 예상 소요: 30분

### Phase 2: Full 복잡도 모듈 (3개)

**목표**: 전체 레이어가 필요한 모듈 완료

- [ ] **Milestone 2.1**: `spaces` 모듈 마이그레이션
- [ ] **Milestone 2.2**: `materials` 모듈 마이그레이션
- [ ] **Milestone 2.3**: `auth` 모듈 마이그레이션

### Phase 3: Medium 복잡도 모듈 (5개)

**목표**: 일부 레이어만 필요한 모듈 완료

- [ ] **Milestone 3.1**: `home` 모듈 마이그레이션
- [ ] **Milestone 3.2**: `jobs` 모듈 마이그레이션
- [ ] **Milestone 3.3**: `session-runs` 모듈 마이그레이션
- [ ] **Milestone 3.4**: `today` 모듈 마이그레이션
- [ ] **Milestone 3.5**: `documents` 모듈 마이그레이션

### Phase 4: Simple 모듈 및 특수 모듈 (3개)

**목표**: 나머지 모듈 완료

- [ ] **Milestone 4.1**: `landing` 모듈 마이그레이션
- [ ] **Milestone 4.2**: `settings` 모듈 마이그레이션
- [ ] **Milestone 4.3**: `app-shell` 모듈 마이그레이션

### Phase 5: 검증 및 정리

- [ ] **Milestone 5.1**: 전체 타입 체크 (`pnpm typecheck`)
- [ ] **Milestone 5.2**: 빌드 검증 (`pnpm build`)
- [ ] **Milestone 5.3**: 기존 `hooks.ts` 파일 정리 (불필요한 re-export 제거)
- [ ] **Milestone 5.4**: import 경로 일관성 검토

---

## 📝 마이그레이션 작업 상세

### 단일 모듈 마이그레이션 절차

각 모듈에 대해 다음 단계를 수행합니다:

#### Step 1: 디렉토리 구조 생성

```
modules/{module}/
├── api/
│   └── index.ts
├── application/
│   └── index.ts
├── domain/
│   └── index.ts
└── ui/
    └── index.ts
```

#### Step 2: 파일 이동 (domain 레이어 먼저)

1. `types.ts` → `domain/types.ts`
2. `policy.ts` → `domain/policy.ts`
3. `utils.ts` 또는 `utils/` → `domain/utils.ts` 또는 `domain/utils/`
4. `domain/index.ts` 작성

#### Step 3: 파일 이동 (api 레이어)

1. `api.ts` → `api/functions.ts`
2. `api-schema.ts` → `api/schema.ts`
3. `api/index.ts` 작성
4. import 경로 수정 (`../domain` 참조)

#### Step 4: 파일 이동 (application 레이어)

1. `keys.ts` → `application/keys.ts`
2. `queries.ts` → `application/queries.ts`
3. `mutations.ts` → `application/mutations.ts`
4. `flows.ts` → `application/flows.ts`
5. `application/index.ts` 작성
6. import 경로 수정 (`../api`, `../domain` 참조)

#### Step 5: 파일 이동 (ui 레이어)

1. `components/` → `ui/components/`
2. `views/` → `ui/views/`
3. `ui/index.ts` 작성
4. import 경로 수정

#### Step 6: 모듈 index.ts 업데이트

- 외부에 노출할 API만 re-export
- 레이어별 그룹화된 export

#### Step 7: 외부 참조 업데이트

- 다른 모듈에서 해당 모듈을 import하는 코드 확인
- 필요 시 import 경로 수정

#### Step 8: 검증

- 타입 체크 실행
- 개발 서버 실행하여 동작 확인

---

## 📁 예시: plans 모듈 마이그레이션 결과

### Before (현재)

```
modules/plans/
├── api-schema.ts
├── api.ts
├── components/
│   ├── index.ts
│   └── plan-status-badge.tsx
├── flows.ts
├── hooks.ts
├── index.ts
├── keys.ts
├── mutations.ts
├── policy.ts
├── queries.ts
├── types.ts
├── utils/
│   ├── index.ts
│   └── plan-goal-label.ts
└── views/
    ├── index.ts
    ├── plan-detail-view.tsx
    ├── plan-wizard-view.tsx
    └── space-plans-view.tsx
```

### After (타겟)

```
modules/plans/
├── api/
│   ├── functions.ts          # from api.ts
│   ├── schema.ts             # from api-schema.ts
│   └── index.ts
├── application/
│   ├── flows.ts              # from flows.ts
│   ├── keys.ts               # from keys.ts
│   ├── mutations.ts          # from mutations.ts
│   ├── queries.ts            # from queries.ts
│   └── index.ts
├── domain/
│   ├── policy.ts             # from policy.ts
│   ├── types.ts              # from types.ts
│   ├── utils/                # from utils/
│   │   ├── index.ts
│   │   └── plan-goal-label.ts
│   └── index.ts
├── ui/
│   ├── components/           # from components/
│   │   ├── index.ts
│   │   └── plan-status-badge.tsx
│   ├── views/                # from views/
│   │   ├── index.ts
│   │   ├── plan-detail-view.tsx
│   │   ├── plan-wizard-view.tsx
│   │   └── space-plans-view.tsx
│   └── index.ts
└── index.ts                  # 업데이트된 public API
```

---

## ⚠️ 주의사항

### Import 경로 변경 규칙

- 상대 경로 사용: `../domain`, `../api` 등
- 모듈 외부에서는 항상 `index.ts`를 통해 import
- 레이어 간 순환 참조 금지

### 레이어별 의존성 규칙 (중요!)

```
ui → application → api → domain
        ↓            ↓
      domain ←───────┘
```

- **domain**: 어떤 레이어에도 의존하지 않음 (순수 비즈니스 로직)
- **api**: domain에만 의존 (타입 import)
- **application**: api, domain에 의존
- **ui**: application, domain에 의존 (api 직접 호출 금지)

### 빈 레이어 처리

- 해당 레이어에 파일이 없으면 레이어 폴더 자체를 생성하지 않음
- 예: `landing` 모듈은 `ui/` 레이어만 존재

---

## ✅ 완료 기준

1. 모든 모듈이 4-레이어 구조로 재구성됨
2. `pnpm typecheck` 통과
3. `pnpm build` 성공
4. 개발 서버에서 모든 페이지 정상 동작
5. 불필요한 `hooks.ts` re-export 파일 제거됨

---

## 📅 예상 소요 시간

| Phase            | 모듈 수  | 예상 시간         |
| ---------------- | -------- | ----------------- |
| Phase 1 (파일럿) | 1개      | 30분              |
| Phase 2 (Full)   | 3개      | 1시간 10분        |
| Phase 3 (Medium) | 5개      | 1시간             |
| Phase 4 (Simple) | 3개      | 30분              |
| Phase 5 (검증)   | -        | 30분              |
| **총계**         | **12개** | **약 3시간 40분** |

---

## 🔄 롤백 계획

마이그레이션 중 문제 발생 시:

1. Git을 통해 변경 사항 되돌리기
2. 모듈 단위로 작업하므로 부분 롤백 가능
3. 각 Phase 완료 후 커밋하여 체크포인트 생성

---

_작성일: 2026-01-02_
_마지막 업데이트: 2026-01-02_
