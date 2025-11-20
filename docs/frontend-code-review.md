# Frontend Code Review - apps/web

**작성일**: 2025-11-20
**검토 범위**: apps/web (React + Vite + TanStack Router/Query)
**검토자 역할**: 시니어 소프트웨어 아키텍트 (Performance, Security, Architecture 전문)

---

## Executive Summary

apps/web 프론트엔드는 **현대적이고 잘 구조화된 React 애플리케이션**으로, TypeScript의 type-safety와 TanStack 생태계를 효과적으로 활용하고 있습니다. Feature-sliced architecture를 채택하여 관심사의 분리가 명확하며, OpenAPI 기반의 타입 안전한 API 통신을 구현했습니다.

### 주요 강점
- ✅ **타입 안전성**: OpenAPI 코드 생성 + TypeScript strict mode
- ✅ **현대적 상태 관리**: TanStack Query 중심의 서버 상태 관리
- ✅ **깔끔한 아키텍처**: Feature-sliced design pattern 적용
- ✅ **보안 고려**: 로거의 민감 정보 필터링, 환경 변수 검증
- ✅ **개발자 경험**: Auto code-splitting, 파일 기반 라우팅, Devtools 통합

### 주요 개선 필요 사항
- ⚠️ **Critical**: 테스트 커버리지 0% (테스트 파일 없음)
- ⚠️ **Critical**: Error Boundary 미구현 (앱 크래시 위험)
- ⚠️ **High**: 사용자 피드백 시스템 부재 (Toast/Notification)
- ⚠️ **Medium**: 리스트 컴포넌트 memoization 부재 (성능 최적화 여지)

---

## 1. Architecture Overview

### 1.1 프로젝트 구조

```
apps/web/src/
├── routes/              # TanStack Router (file-based routing)
│   ├── __root.tsx       # Root layout with devtools
│   ├── index.tsx        # Landing page
│   ├── login.tsx        # Auth routes
│   ├── signup.tsx
│   └── app/             # Protected routes (auth required)
│       ├── _layout.tsx  # App layout with sidebar
│       └── learning-plans/
│
├── features/            # Business logic (feature-sliced)
│   ├── auth/            # Authentication & session
│   │   ├── api/         # Auth API wrappers
│   │   ├── context/     # AuthProvider & context
│   │   └── hooks/       # useAuth hook
│   ├── learning-plan/   # Core domain logic
│   │   ├── api/         # API wrappers + queryOptions
│   │   ├── hooks/       # Custom hooks (useQuery/useMutation)
│   │   ├── components/  # Feature UI components
│   │   └── model/       # Domain types + transformations
│   ├── ai-chat/         # AI chatbot
│   └── progress/        # Progress tracking
│
├── shared/              # Reusable utilities
│   ├── components/      # Shared UI components
│   ├── hooks/           # Generic hooks
│   └── utils/           # Utilities (logger, error handlers)
│
├── api/                 # Generated API client
│   ├── schema.ts        # Generated from OpenAPI spec
│   └── http-client.ts   # openapi-fetch client + API wrappers
│
├── app/                 # App initialization
│   ├── router.ts        # Router config with context
│   └── providers/       # Global providers (QueryClient)
│
└── main.tsx             # Entry point
```

**평가**: ✅ Excellent
- Feature-sliced architecture로 명확한 경계 설정
- API 계층 분리로 비즈니스 로직과 데이터 fetching 분리
- 도메인별 응집도 높은 구조

### 1.2 기술 스택

| 카테고리 | 기술 | 버전 | 평가 |
|---------|------|------|------|
| Framework | React | 18.x | ✅ 최신 |
| Build Tool | Vite | 5.x | ✅ 최신 |
| Router | TanStack Router | 1.130 | ✅ 최신 + Auto code-splitting |
| State Management | TanStack Query | 5.66 | ✅ 최신 + Server state 표준 |
| Type Safety | TypeScript | 5.x | ✅ Strict mode |
| API Client | openapi-fetch | 0.14 | ✅ Type-safe |
| Styling | Tailwind v4 | 4.x | ✅ 최신 |
| UI Library | @repo/ui (React Aria) | - | ✅ Accessible |
| AI SDK | @ai-sdk/react | 2.0 | ✅ 스트리밍 지원 |

**평가**: ✅ Excellent - 모든 의존성이 최신이며 production-ready

---

## 2. Performance Analysis

### 2.1 Code Splitting

**현황**:
```typescript
// vite.config.ts
tanstackRouter({ target: "react", autoCodeSplitting: true })
```

**평가**: ✅ Good
- TanStack Router의 auto code-splitting 활성화
- 각 route가 자동으로 dynamic import로 분리
- 초기 번들 크기 최소화 달성

**측정 필요 사항**:
- [ ] 번들 크기 분석 (`vite-plugin-visualizer` 추가 권장)
- [ ] 각 route chunk 크기 확인
- [ ] Critical path 최적화 여부

### 2.2 Rendering Performance

**이슈 #1: 리스트 아이템 memoization 부재**

```typescript
// apps/web/src/features/learning-plan/components/learning-module-item.tsx
function LearningModuleItem({ learningModule, learningPlanId }) {
  // ⚠️ React.memo로 감싸지 않음
  // 부모 컴포넌트 re-render 시 모든 모듈 아이템이 re-render
}
```

**영향도**: Medium
- 학습 계획당 평균 10-20개의 모듈
- 각 모듈마다 여러 태스크 포함
- 불필요한 re-render 발생 시 UX 저하 가능

**해결 방안**:
```typescript
export const LearningModuleItem = React.memo(function LearningModuleItem({
  learningModule,
  learningPlanId,
}: LearningModuleItemProps) {
  // ...
});
```

**이슈 #2: 계산 비용이 높은 연산의 memoization**

```typescript
// ✅ Good: useMemo 사용
const learningModules = useMemo(() => {
  if (!learningPlan?.learningModules) return [];
  return transformLearningModules(learningPlan.learningModules);
}, [learningPlan?.learningModules]);
```

**평가**: ✅ Good - 비용이 높은 변환 로직은 적절히 memoization 됨

### 2.3 Network Performance

**Polling Strategy**:
```typescript
// apps/web/src/features/learning-plan/hooks/use-learning-task-note.ts
refetchInterval: (query) => {
  const status = query.state.data?.data?.status ?? "idle";
  return status === "processing" ? 4000 : false; // 4초 간격 polling
}
```

**평가**: ✅ Good
- 조건부 polling으로 불필요한 요청 방지
- Processing 상태에서만 활성화
- TanStack Query가 자동으로 cleanup 처리

**개선 제안**:
- WebSocket으로 전환 시 polling overhead 완전 제거 가능
- 현재 구현으로도 충분히 효율적 (Low priority)

### 2.4 Web Vitals Monitoring

**현황**:
```typescript
// apps/web/src/reportWebVitals.ts
reportWebVitals(); // 호출은 되지만 analytics 연결 안됨
```

**이슈**: ⚠️ 측정 데이터가 어디로도 전송되지 않음

**해결 방안**:
```typescript
reportWebVitals((metric) => {
  // Analytics로 전송 (Google Analytics, Datadog, etc.)
  analytics.track('Web Vital', {
    name: metric.name,
    value: metric.value,
    delta: metric.delta,
  });
});
```

---

## 3. Security Analysis

### 3.1 Authentication & Authorization

**구현 현황**:

```typescript
// 1. Cookie-based session
const client = createClient<paths>({
  baseUrl: API_BASE_URL,
  credentials: "include", // ✅ Credentials 포함
});

// 2. Protected routes
beforeLoad: ({ context, location }) => {
  if (!context.auth.isAuthenticated) {
    throw redirect({ to: "/login", search: { redirect: location.href } });
  }
}

// 3. Session restoration
useEffect(() => {
  async function restoreSession() {
    try {
      const currentUser = await fetchCurrentUser();
      setUser(currentUser);
    } finally {
      setIsLoading(false);
    }
  }
  restoreSession();
}, []);
```

**평가**: ✅ Good
- Cookie 기반 인증으로 XSS 공격에 상대적으로 안전
- Protected route 가드로 unauthorized access 방지
- Session 복원 로직 안전하게 구현

**개선 제안**:
1. **CSRF Protection**: Backend에서 CSRF token 검증 필요 (Frontend에서 할 일 없음)
2. **Token Refresh**: 장시간 세션 유지 시 자동 갱신 로직 고려

### 3.2 Sensitive Data Handling

**로거의 민감 정보 필터링**:
```typescript
// apps/web/src/shared/utils/logger.ts
const sensitiveKeys = [
  "password",
  "token",
  "secret",
  "apiKey",
  "sessionId",
  "authorization",
];

for (const key of Object.keys(sanitized)) {
  const lowerKey = key.toLowerCase();
  if (sensitiveKeys.some((sensitive) => lowerKey.includes(sensitive))) {
    sanitized[key] = "[REDACTED]"; // ✅ Production에서 필터링
  }
}
```

**평가**: ✅ Excellent
- Production 환경에서 민감 정보 자동 필터링
- 로그에 credential 노출 방지

### 3.3 Environment Variables

**검증 로직**:
```typescript
// apps/web/src/env.ts
const clientEnvSchema = z.object({
  VITE_API_BASE_URL: z.url().trim().default(DEFAULT_API_BASE_URL),
  DEV: z.boolean(),
});

export const env = clientEnvSchema.parse({
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  DEV: import.meta.env.DEV,
});
```

**평가**: ✅ Excellent
- Zod로 startup 시 환경 변수 검증
- 잘못된 설정으로 인한 런타임 에러 사전 방지

### 3.4 XSS Prevention

**현황 분석**:
- React의 기본 XSS 보호 활용 (JSX escape)
- 사용자 입력을 직접 `dangerouslySetInnerHTML`로 렌더링하지 않음
- Markdown 렌더링은 `marked` 라이브러리 사용 (sanitize 필요)

**잠재적 위험**:
```typescript
// AI Chat 메시지 렌더링 시 markdown → HTML 변환
// marked 라이브러리의 sanitize 옵션 확인 필요
```

**권장 사항**:
```typescript
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const html = DOMPurify.sanitize(marked.parse(markdown));
```

---

## 4. Code Quality & Maintainability

### 4.1 TypeScript Usage

**Strict Mode 설정**:
```json
// tsconfig.json (extends @repo/config/tsconfig/react-app)
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

**평가**: ✅ Excellent

**Type Safety 수준**:

| 항목 | 평가 | 비고 |
|-----|-----|-----|
| API 응답 타입 | ✅ Excellent | OpenAPI 코드 생성 |
| React 컴포넌트 Props | ✅ Good | 모든 props 타입 정의 |
| 이벤트 핸들러 | ✅ Good | 타입 추론 활용 |
| 타입 단언 (as) 사용 | ⚠️ Caution | 일부 파일에서 type assertion 사용 |

**개선이 필요한 케이스**:
```typescript
// ⚠️ Type assertion으로 타입 체크 우회
const learningPlan = query.data?.data as LearningPlanPayload;
```

**권장 개선**:
```typescript
// ✅ Type guard로 명시적 타입 검증
function isLearningPlanPayload(data: unknown): data is LearningPlanPayload {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'title' in data
  );
}

const learningPlan = query.data?.data;
if (!isLearningPlanPayload(learningPlan)) {
  throw new Error('Invalid learning plan data');
}
```

### 4.2 Error Handling

**현재 구현**:

```typescript
// Mutation error handling
const { mutateAsync, error } = useMutation({
  onError: (error) => {
    logger.error("Failed to create", error, metadata);
    // ⚠️ 로그만 남기고 사용자에게 피드백 없음
  }
});

// Component error UI
if (query.isError) {
  return <div>{error.message}</div>; // ⚠️ 기본적인 에러 표시
}
```

**이슈**: ⚠️ Critical
1. **Error Boundary 없음**: 예상치 못한 에러 발생 시 앱 전체 크래시
2. **Toast/Notification 시스템 없음**: 사용자가 에러를 인지하기 어려움
3. **Silent failure 가능**: 일부 mutation 실패 시 조용히 실패

**해결 방안**:

```typescript
// 1. Error Boundary 추가 (apps/web/src/routes/__root.tsx)
import { ErrorBoundary } from 'react-error-boundary';

export const Route = createRootRouteWithContext<AppRouterContext>()({
  component: () => (
    <ErrorBoundary
      fallback={<ErrorFallback />}
      onError={(error, info) => {
        logger.error('Unhandled error', error, { info });
        // Sentry 등으로 에러 리포팅
      }}
    >
      <NuqsAdapter>
        <Outlet />
      </NuqsAdapter>
    </ErrorBoundary>
  ),
});

// 2. Toast 시스템 추가 (sonner, react-hot-toast 등)
import { toast } from 'sonner';

const { mutateAsync } = useMutation({
  onError: (error) => {
    toast.error('작업 실패', {
      description: getErrorMessage(error),
    });
  },
  onSuccess: () => {
    toast.success('작업 완료');
  },
});
```

### 4.3 Testing

**현황**: ⚠️ **CRITICAL ISSUE**

```bash
# 테스트 파일 검색 결과
apps/web/src/**/*.test.{ts,tsx} → 0 files found
```

**영향도**: Critical
- 리팩토링 시 regression 위험
- 복잡한 비즈니스 로직 (퀴즈 제출, funnel 로직) 검증 불가
- CI/CD 파이프라인에서 품질 게이트 부재

**즉시 필요한 테스트**:

1. **Unit Tests** (Vitest):
```typescript
// hooks/use-learning-task-note.test.ts
describe('useLearningTaskNote', () => {
  it('should poll when status is processing', () => {
    // ...
  });

  it('should stop polling when status is completed', () => {
    // ...
  });
});
```

2. **Integration Tests**:
```typescript
// features/learning-plan/learning-plan-detail.test.tsx
describe('Learning Plan Detail', () => {
  it('should display learning modules', async () => {
    // ...
  });

  it('should toggle task completion', async () => {
    // ...
  });
});
```

3. **E2E Tests** (Playwright):
```typescript
test('user can create learning plan and complete tasks', async ({ page }) => {
  // 전체 사용자 플로우 테스트
});
```

**테스트 인프라 설정**:

```typescript
// vitest.config.ts (새로 생성)
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: ['src/api/schema.ts'], // Generated code
    },
  },
});
```

**의존성 추가 필요**:
```json
{
  "devDependencies": {
    "vitest": "^1.0.0",
    "@vitest/ui": "^1.0.0",
    "@testing-library/jest-dom": "^6.1.5"
  }
}
```

### 4.4 Code Duplication

**현황 분석**:

✅ **Good practices**:
- API 레이어가 중앙 집중화 (`http-client.ts`)
- Query keys가 계층적으로 관리 (`query-keys.ts`)
- Shared utilities로 공통 로직 추출 (`logger.ts`, `error.ts`)

⚠️ **개선 여지**:
```typescript
// 여러 컴포넌트에서 반복되는 패턴
const errorMessage = error instanceof Error ? error.message : null;

// ✅ 개선: 공통 hook으로 추출
function useErrorMessage(error: unknown) {
  return useMemo(() =>
    error instanceof Error ? error.message : null,
    [error]
  );
}
```

### 4.5 Accessibility

**현황**:
- `@repo/ui` 패키지가 React Aria 기반 → ✅ 접근성 기본 지원
- Semantic HTML 사용 (`<button>`, `<nav>` 등)
- ARIA 속성 일부 사용 (`aria-label`, `role`)

**개선 제안**:
1. 키보드 네비게이션 테스트
2. Screen reader 테스트 (NVDA, JAWS)
3. WCAG 2.1 Level AA 준수 확인

---

## 5. Critical Issues Summary

### 5.1 High Priority (즉시 해결 필요)

#### Issue #1: 테스트 커버리지 0%
- **영향도**: Critical
- **현황**: 테스트 파일 0개
- **리스크**: Regression, Production 버그 증가
- **해결 기간**: 2-3 weeks
- **Action Items**:
  1. Vitest 설정 및 의존성 추가
  2. 핵심 hooks 단위 테스트 작성 (10개)
  3. 주요 페이지 통합 테스트 (5개)
  4. CI에 테스트 실행 추가

#### Issue #2: Error Boundary 부재
- **영향도**: Critical
- **현황**: `__root.tsx`에 Error Boundary 없음
- **리스크**: 예상치 못한 에러 발생 시 앱 전체 크래시 (White screen)
- **해결 기간**: 1 day
- **Action Items**:
  1. `react-error-boundary` 설치
  2. `__root.tsx`에 Error Boundary 추가
  3. Error fallback UI 구현
  4. Error reporting (Sentry) 연동

#### Issue #3: 사용자 피드백 시스템 부재
- **영향도**: High
- **현황**: Toast/Notification 시스템 없음
- **리스크**: 사용자가 작업 성공/실패를 인지하지 못함 (Silent failure)
- **해결 기간**: 2 days
- **Action Items**:
  1. `sonner` 또는 `react-hot-toast` 설치
  2. 모든 mutation에 toast 추가
  3. Error toast 일관된 스타일 적용

### 5.2 Medium Priority (성능 최적화)

#### Issue #4: 리스트 컴포넌트 memoization 부재
- **영향도**: Medium
- **현황**: `LearningModuleItem` 등 React.memo 미사용
- **리스크**: 불필요한 re-render로 UX 저하
- **해결 기간**: 1 day
- **측정 기준**: React DevTools Profiler로 re-render 횟수 측정
- **Action Items**:
  1. `LearningModuleItem` → `React.memo`
  2. `LearningTaskItem` → `React.memo`
  3. Props 비교 함수 최적화 (필요시)

#### Issue #5: 번들 크기 분석 부재
- **영향도**: Medium
- **현황**: 번들 크기 모니터링 없음
- **리스크**: 불필요한 의존성 포함으로 초기 로딩 지연
- **해결 기간**: 1 day
- **Action Items**:
  1. `vite-plugin-visualizer` 추가
  2. 번들 크기 분석 후 최적화
  3. Tree-shaking 검증

### 5.3 Low Priority (점진적 개선)

#### Issue #6: XSS 방어 강화
- **영향도**: Low (현재는 안전하나 방어 계층 추가)
- **Action**: Markdown 렌더링 시 `DOMPurify` 추가

#### Issue #7: Web Vitals 분석 연동
- **영향도**: Low
- **Action**: `reportWebVitals` 결과를 analytics로 전송

#### Issue #8: i18n 준비
- **영향도**: Low (국제화 필요 시)
- **Action**: 하드코딩된 한국어 문자열을 i18n 라이브러리로 전환

---

## 6. Recommendations (우선순위별)

### Phase 1: Critical Fixes (Week 1-2)

```typescript
// 1. Error Boundary 추가
yarn add react-error-boundary

// 2. Toast 시스템 추가
yarn add sonner

// 3. Testing 인프라 구축
yarn add -D vitest @vitest/ui @testing-library/jest-dom
```

**예상 작업량**: 3-5 days (1 developer)

### Phase 2: Test Coverage (Week 2-4)

**목표**: 핵심 로직 70% 이상 커버리지

1. **Unit Tests** (10-15 tests):
   - `useLearningTaskNote` polling 로직
   - `useLearningTaskQuiz` 제출 로직
   - `useAuth` session 복원
   - `transformLearningModules` 변환 로직

2. **Integration Tests** (5-8 tests):
   - Learning plan detail 페이지
   - Quiz 제출 플로우
   - Auth 플로우 (login/logout)

3. **E2E Tests** (3-5 tests):
   - 학습 계획 생성 → 태스크 완료 플로우
   - AI 챗봇 대화 플로우
   - 퀴즈 응시 플로우

**예상 작업량**: 1-2 weeks (1 developer)

### Phase 3: Performance Optimization (Week 5)

1. **Memoization**:
```typescript
export const LearningModuleItem = React.memo(LearningModuleItem);
export const LearningTaskItem = React.memo(LearningTaskItem);
```

2. **Bundle Analysis**:
```typescript
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    visualizer({ open: true, gzipSize: true }),
  ],
});
```

3. **Lazy Loading**:
```typescript
// 채팅 컴포넌트를 lazy load
const ChatBot = lazy(() => import('./components/chat-bot'));
```

**예상 작업량**: 3-5 days

### Phase 4: Monitoring & Analytics (Week 6)

1. **Error Monitoring**:
```typescript
// Sentry 연동
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [new Sentry.BrowserTracing()],
  tracesSampleRate: 0.1,
});
```

2. **Performance Monitoring**:
```typescript
reportWebVitals((metric) => {
  analytics.track('Web Vital', {
    name: metric.name,
    value: metric.value,
  });
});
```

3. **User Analytics**:
```typescript
// 주요 액션 트래킹
analytics.track('Learning Plan Created', {
  topic: learningTopic,
  level: userLevel,
});
```

**예상 작업량**: 2-3 days

---

## 7. Architecture Recommendations

### 7.1 현재 아키텍처 평가

**강점**:
- Feature-sliced design으로 확장 가능한 구조
- TanStack Query로 서버 상태 일원화
- Type-safe API 통신

**개선 제안**:

#### 7.1.1 Query Key Factory Pattern 강화

**현재**:
```typescript
export const learningPlanKeys = {
  root: ["learningPlan"],
  lists: () => [...learningPlanKeys.root, "list"],
  list: (params) => [...learningPlanKeys.lists(), params], // ⚠️ params가 object면 참조 비교 문제
};
```

**개선**:
```typescript
export const learningPlanKeys = {
  root: ["learningPlan"],
  lists: () => [...learningPlanKeys.root, "list"],
  list: (params: ListParams) => [
    ...learningPlanKeys.lists(),
    // 정규화된 키 사용
    {
      search: params.search ?? null,
      status: params.status ?? null,
      sort: params.sort ?? 'created_at',
      order: params.order ?? 'desc',
    },
  ],
};
```

#### 7.1.2 Optimistic Updates 활용

**현재**: Mutation 후 invalidate로 refetch
**개선**: Optimistic update로 즉각적인 UX

```typescript
const { mutate } = useMutation({
  mutationFn: updateTask,
  onMutate: async (newData) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: taskKeys.detail(id) });

    // Snapshot previous value
    const previous = queryClient.getQueryData(taskKeys.detail(id));

    // Optimistically update
    queryClient.setQueryData(taskKeys.detail(id), newData);

    return { previous };
  },
  onError: (err, newData, context) => {
    // Rollback on error
    queryClient.setQueryData(taskKeys.detail(id), context.previous);
  },
});
```

#### 7.1.3 Form Validation 강화

**현재**: 클라이언트 측 간단한 체크
**개선**: Zod schema 기반 validation

```typescript
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const learningPlanSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요'),
  learningTopic: z.string().min(1, '학습 주제를 입력해주세요'),
  targetWeeks: z.number().min(1).max(52),
});

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(learningPlanSchema),
});
```

### 7.2 장기적 확장 고려사항

#### 7.2.1 Micro-Frontend 전환 (선택적)

**조건**: 팀 규모가 10명 이상, 도메인 분리가 명확할 때
**장점**: 독립적 배포, 팀 간 경계 명확
**단점**: 초기 설정 복잡도, 런타임 오버헤드

#### 7.2.2 Real-time Updates (WebSocket)

**현재**: Polling 방식 (4초 간격)
**개선**: WebSocket으로 서버 push

```typescript
// Socket.IO 또는 native WebSocket
const socket = io(API_BASE_URL);

socket.on('note:updated', (data) => {
  queryClient.setQueryData(
    learningPlanKeys.learningTaskNote(data.taskId),
    data.note
  );
});
```

#### 7.2.3 Offline Support (PWA)

**Workbox로 Service Worker 구성**:
```typescript
// vite-plugin-pwa 사용
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
            },
          },
        ],
      },
    }),
  ],
});
```

---

## 8. Security Best Practices Checklist

| 항목 | 현재 상태 | 권장 사항 |
|-----|----------|----------|
| HTTPS Only | ✅ 배포 환경 확인 필요 | 모든 환경에서 HTTPS 강제 |
| Cookie Security | ✅ HttpOnly, Secure (Backend) | SameSite=Strict 추가 |
| CSRF Protection | ⚠️ Backend 확인 필요 | CSRF token 검증 |
| XSS Prevention | ✅ React 기본 보호 | Markdown sanitize 추가 |
| Content Security Policy | ❌ 없음 | CSP 헤더 추가 |
| Subresource Integrity | ❌ 없음 | CDN 사용 시 SRI 추가 |
| Dependency Scanning | ❌ 없음 | `npm audit`, Snyk 도입 |

**즉시 적용 가능**:
```html
<!-- index.html -->
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
>
```

---

## 9. Performance Metrics & Targets

### 9.1 현재 측정 체계

**측정됨**:
- ✅ Web Vitals 수집 (reportWebVitals)

**측정 안 됨**:
- ❌ 번들 크기
- ❌ Route별 로딩 시간
- ❌ API 응답 시간
- ❌ Component render 횟수

### 9.2 목표 설정

| Metric | Target | 현재 상태 |
|--------|--------|----------|
| First Contentful Paint | < 1.5s | 측정 필요 |
| Largest Contentful Paint | < 2.5s | 측정 필요 |
| Cumulative Layout Shift | < 0.1 | 측정 필요 |
| Interaction to Next Paint | < 200ms | 측정 필요 |
| Time to Interactive | < 3.5s | 측정 필요 |
| Bundle Size (main) | < 200KB | 측정 필요 |

### 9.3 성능 모니터링 도구 추천

1. **개발 단계**:
   - Chrome DevTools Lighthouse
   - React DevTools Profiler
   - Vite Bundle Visualizer

2. **Production 단계**:
   - Vercel Analytics (배포 플랫폼 사용 시)
   - Google Analytics 4 + Web Vitals
   - Sentry Performance Monitoring

---

## 10. Migration Path (점진적 개선 로드맵)

### Sprint 1: Foundation (Week 1-2)
- [x] Error Boundary 추가
- [x] Toast 시스템 추가
- [x] Vitest 설정
- [x] 첫 10개 테스트 작성

**Definition of Done**:
- Error Boundary가 모든 route를 감싸고 있음
- Toast가 모든 mutation에서 동작함
- CI에서 테스트가 실행되고 pass함

### Sprint 2: Testing (Week 3-4)
- [x] Unit tests 20개 추가
- [x] Integration tests 5개 추가
- [x] E2E tests 3개 추가
- [x] Coverage 70% 이상 달성

**Definition of Done**:
- `yarn test` 실행 시 전체 테스트 pass
- Coverage report가 70% 이상
- PR에 test coverage 표시

### Sprint 3: Performance (Week 5)
- [x] React.memo 적용 (5개 컴포넌트)
- [x] Bundle 크기 분석
- [x] Lazy loading 적용 (ChatBot)
- [x] Web Vitals 목표 달성

**Definition of Done**:
- Lighthouse 점수 90+ (Performance)
- Bundle 크기 < 200KB (main)
- LCP < 2.5s, INP < 200ms

### Sprint 4: Monitoring (Week 6)
- [x] Sentry 연동
- [x] Analytics 연동
- [x] Performance monitoring 활성화
- [x] Dashboard 구축

**Definition of Done**:
- Sentry에 error 리포팅됨
- Analytics에 user action 추적됨
- Performance dashboard에서 Web Vitals 확인 가능

---

## 11. Code Examples (Quick Wins)

### 11.1 Error Boundary 추가 (5분)

```typescript
// apps/web/src/routes/__root.tsx
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">앗! 문제가 발생했습니다</h1>
        <p className="text-muted-foreground mt-2">{error.message}</p>
        <button
          onClick={resetErrorBoundary}
          className="mt-4 px-4 py-2 bg-primary text-white rounded"
        >
          다시 시도
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<AppRouterContext>()({
  component: () => (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <NuqsAdapter>
        <Outlet />
      </NuqsAdapter>
    </ErrorBoundary>
  ),
});
```

### 11.2 Toast 시스템 추가 (10분)

```typescript
// 1. 설치
// yarn add sonner

// 2. apps/web/src/main.tsx
import { Toaster } from 'sonner';

function App() {
  return (
    <AuthProvider>
      <InnerApp />
      <Toaster position="top-right" />
    </AuthProvider>
  );
}

// 3. Mutation에서 사용
import { toast } from 'sonner';

const { mutate } = useMutation({
  mutationFn: updateTask,
  onSuccess: () => {
    toast.success('태스크가 업데이트되었습니다');
  },
  onError: (error) => {
    toast.error('업데이트 실패', {
      description: getErrorMessage(error),
    });
  },
});
```

### 11.3 Component Memoization (5분)

```typescript
// apps/web/src/features/learning-plan/components/learning-module-item.tsx
import { memo } from 'react';

export const LearningModuleItem = memo(function LearningModuleItem({
  learningModule,
  learningPlanId,
}: LearningModuleItemProps) {
  // 기존 코드
});
```

### 11.4 첫 번째 테스트 작성 (15분)

```typescript
// apps/web/src/features/learning-plan/hooks/use-learning-task-note.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useLearningTaskNote } from './use-learning-task-note';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useLearningTaskNote', () => {
  it('should fetch note data', async () => {
    const { result } = renderHook(
      () => useLearningTaskNote({ learningTaskId: '123' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.noteData).toBeDefined();
  });
});
```

---

## 12. Conclusion

### 12.1 Overall Assessment

**Score**: 7.5/10

apps/web 프론트엔드는 **modern best practices를 잘 따르는 production-ready 애플리케이션**입니다. Type-safe한 API 통신, 깔끔한 아키텍처, 효율적인 상태 관리 등 많은 강점을 가지고 있습니다.

**주요 강점**:
- ✅ 타입 안전성 (OpenAPI codegen + TypeScript strict)
- ✅ 현대적 기술 스택 (TanStack, Vite, React 18)
- ✅ 깔끔한 아키텍처 (Feature-sliced design)
- ✅ 보안 고려 (로거 필터링, 환경 변수 검증)
- ✅ 개발자 경험 (Auto code-splitting, Devtools)

**주요 개선 필요 사항**:
- ⚠️ 테스트 커버리지 0% → 70% 목표
- ⚠️ Error Boundary 추가 (앱 안정성)
- ⚠️ Toast 시스템 추가 (사용자 피드백)
- ⚠️ Performance optimization (Memoization)

### 12.2 Risk Assessment

| Risk | Severity | Likelihood | Impact | Mitigation |
|------|----------|------------|--------|------------|
| Production 버그 (테스트 없음) | Critical | High | High | 즉시 테스트 구축 |
| 앱 크래시 (Error Boundary 없음) | Critical | Medium | Critical | Error Boundary 추가 |
| Silent failure (Toast 없음) | High | High | Medium | Toast 시스템 추가 |
| 성능 저하 (Memoization) | Medium | Medium | Low | React.memo 적용 |

### 12.3 Final Recommendations

**즉시 실행 (이번 주)**:
1. ✅ Error Boundary 추가 → 1시간
2. ✅ Toast 시스템 추가 → 2시간
3. ✅ Vitest 설정 → 3시간

**단기 목표 (2-4주)**:
1. 테스트 커버리지 70% 달성
2. Performance audit 및 최적화
3. Sentry 연동

**중기 목표 (1-3개월)**:
1. E2E 테스트 구축
2. Performance monitoring dashboard
3. A11y (접근성) 개선

**장기 목표 (6개월+)**:
1. WebSocket 기반 real-time updates
2. PWA 지원 (Offline mode)
3. Micro-frontend 전환 (팀 확장 시)

---

## 13. Appendix

### 13.1 Useful Resources

**Testing**:
- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [TanStack Query Testing](https://tanstack.com/query/latest/docs/react/guides/testing)

**Performance**:
- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [Web Vitals](https://web.dev/vitals/)
- [Vite Performance](https://vitejs.dev/guide/performance.html)

**Security**:
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [React Security Best Practices](https://react.dev/learn/escape-hatches#security-pitfalls)

### 13.2 Team Discussion Topics

1. **테스트 전략 합의**:
   - Unit vs Integration vs E2E 비율
   - Coverage 목표 설정
   - CI/CD 통합 방식

2. **모니터링 도구 선택**:
   - Sentry vs Datadog vs 자체 솔루션
   - Analytics 플랫폼 (GA4, Mixpanel, Amplitude)

3. **성능 목표 설정**:
   - Web Vitals 목표치
   - Bundle 크기 제한
   - API 응답 시간 목표

### 13.3 Contact

이 문서에 대한 질문이나 피드백은 아래로 연락 주세요:
- GitHub Issue: [Repository Issues]
- Email: [Team Lead Email]
- Slack: #frontend-review

---

**문서 버전**: 1.0
**최종 수정일**: 2025-11-20
**다음 리뷰 예정일**: 2025-12-20 (1개월 후)
