# Frontend Architecture Code Review - apps/web

## Executive Summary
The frontend is a well-structured React application using TanStack Router, TanStack Query, and React Aria Components. The codebase shows good architectural patterns with feature-based organization, but has opportunities for optimization in performance, state management consistency, accessibility, and code quality.

**Metrics:**
- Total Files: 69 TypeScript/TSX files
- Total Lines of Code: 11,758
- Largest Component: 432 lines (ai-quiz-tab.tsx)
- TanStack Query Usage: 33 instances
- State Hooks Usage: 52 instances
- Memoization: Only 22 instances across codebase
- Error Boundaries: 0 (no ErrorBoundary components)
- Accessibility Attributes: 13 instances
- Console Statements: 8 instances (debug code)

---

## 1. ARCHITECTURE PATTERNS

### File-Based Routing (TanStack Router)
**Status: WELL IMPLEMENTED ✓**

Routes organized cleanly with file-based convention:
- Root: `/src/routes/__root.tsx`
- Layout: `/src/routes/app/route.tsx` 
- Dynamic Routes: `$learningPlanId/`, `$learningTaskId`

**Code Example:**
```typescript
export const Route = createFileRoute("/app/learning-plans/$learningPlanId/")({
  component: RouteComponent,
});
```

**Good Practices:**
- Uses TanStack Router v1.130+ with modern features
- Preload strategy configured (`defaultPreload: "intent"`)
- Scroll restoration enabled
- URL state management with `nuqs` for query parameters

**Areas for Improvement:**
- No middleware/guards for protected routes (auth happens at beforeLoad only)
- Missing route preloading for critical paths

---

### State Management Architecture
**Status: GOOD with INCONSISTENCIES ⚠️**

**TanStack Query Setup:**
- Query client properly initialized in `src/app/providers/query-client.tsx`
- Query options pattern well-established: `learningPlanQueryOptions(id)`
- Query key factory pattern: `learningPlanKeys`

**Issues Identified:**

1. **Inconsistent Query Invalidation Strategy**
   - In `use-learning-task-quiz.ts`, uses explicit query keys:
     ```typescript
     await queryClient.invalidateQueries({
       queryKey: learningPlanKeys.learningTaskQuiz(learningTaskId),
     });
     ```
   - In `use-conversations.ts`, uses generic string keys:
     ```typescript
     queryClient.invalidateQueries({
       queryKey: ["conversations", learningPlanId],
     });
     ```
   **Recommendation:** Use query key factory for ALL query invalidation

2. **Missing Suspense Boundaries**
   - Only 1 file uses Suspense: `src/routes/app/index.tsx`
   - Routes using `useSuspenseQuery` need Suspense fallback handling
   - Current pattern: directly use `useLearningPlanList()` without error fallback

3. **No Global Error Handler**
   - Each hook handles errors independently
   - No centralized error logging/reporting

---

### Auth Context Pattern
**Status: GOOD ✓**

Context-based auth state management in `src/features/auth/context/auth-context.tsx`:

**Strengths:**
- Proper cleanup (isMounted flag prevents memory leaks)
- Memoized context value to prevent unnecessary re-renders
- Clear AuthContextValue interface
- Session restoration on mount

**Example:**
```typescript
useEffect(() => {
  let isMounted = true;
  async function restoreSession() {
    try {
      const currentUser = await fetchCurrentUser();
      if (!isMounted) return; // Prevent state update on unmounted component
      setUser(currentUser);
    } finally {
      if (isMounted) {
        setIsLoading(false);
      }
    }
  }
  restoreSession();
  return () => { isMounted = false; };
}, []);
```

**Issues:**
- Auth context spread into router context (potential over-coupling)
- No logout side effects (cache clearing, redirect)

---

### Feature-Based Organization
**Status: WELL IMPLEMENTED ✓**

Excellent feature segregation:
```
src/features/
├── ai-chat/
│   ├── components/
│   ├── hooks/
│   └── ...
├── auth/
├── learning-plan/
│   ├── api/
│   ├── components/
│   ├── hooks/
│   ├── model/
│   └── repositories/
└── progress/
```

Each feature has:
- API layer (service + query options)
- Components (organized by domain)
- Custom hooks
- Type definitions

---

## 2. CODE QUALITY ISSUES

### Critical Issues

#### 1. Hardcoded URLs
**Severity: HIGH**
**Files:**
- `src/api/http-client.ts:16` - baseUrl hardcoded to `localhost:3001`
- `src/features/ai-chat/hooks/use-ai-chat.ts:25` - API endpoint hardcoded

```typescript
// ❌ BAD - from http-client.ts
const client = createClient<paths>({
  baseUrl: "http://localhost:3001",  // Hardcoded
  credentials: "include",
});

// ❌ BAD - from use-ai-chat.ts
const chat = useChat<AppUIMessage>({
  transport: new DefaultChatTransport({
    api: "http://localhost:3001/chat/stream",  // Hardcoded
    credentials: "include",
  }),
});
```

**Recommendation:**
```typescript
// ✓ GOOD
const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
const client = createClient<paths>({
  baseUrl,
  credentials: "include",
});
```

**Action:** Add to `.env.local`:
```
VITE_API_URL=http://localhost:3001
```

---

#### 2. Console Statements in Production Code
**Severity: MEDIUM**
**Found 8 instances:**

```typescript
// src/features/ai-chat/hooks/use-ai-chat.ts:22
console.log("useAIChat conversationId:", conversationId);

// src/features/learning-plan/components/learning-plan-funnel/steps/pdf-input-step.tsx:55
console.log("handleDelete", _documentId);

// src/features/ai-chat/components/ai-chat-section.tsx:46
console.error("대화 생성 실패:", error);
```

**Recommendation:** Remove or use logger with environment-based filtering:
```typescript
const logger = {
  log: (...args: unknown[]) => {
    if (import.meta.env.DEV) console.log(...args);
  },
  error: (...args: unknown[]) => {
    console.error(...args); // Keep errors
    // Report to monitoring service
  },
};
```

---

#### 3. Type Safety Issues
**Severity: MEDIUM**
**Count: 10 instances of type bypassing**

```typescript
// src/api/http-client.ts:276 - Type assertion
body: formData as unknown as DocumentUploadBody,

// src/features/learning-plan/components/learning-task-item.tsx:254
className={`flex items-start gap-3 p-3 rounded-lg border border-muted transition-colors hover:bg-muted/40 cursor-pointer ${className || ""}`}
// Missing type for dynamic className

// src/features/ai-chat/hooks/use-conversations.ts:95
error: error as Error | null,
```

**Recommendation:** Enhance type definitions to avoid assertions:
```typescript
// Before: error as Error | null
// After: Use Zod schema for API response
const ResponseSchema = z.object({
  error: z.object({
    message: z.string(),
  }).optional(),
});
```

---

### Code Duplication

#### 1. Repeated Date Formatting
**Files affected:**
- `src/features/learning-plan/components/learning-task-item.tsx:181`
- `src/features/learning-plan/components/learning-plan-card.tsx:181`
- `src/features/learning-plan/components/learning-plan-info.tsx:62, 70`

```typescript
// Duplicated in 4 places
new Date(learningPlan.createdAt).toLocaleDateString("ko-KR")
```

**Recommendation:** Create shared utility:
```typescript
// src/shared/utils/date-formatter.ts
export const formatDate = (date: string | Date, locale = "ko-KR") => {
  return new Date(date).toLocaleDateString(locale);
};
```

#### 2. Repeated Error Handling Pattern
**Files affected:** `pdf-input-step.tsx`, `ai-recommendations-step.tsx`, `ai-chat-section.tsx`

```typescript
// Pattern repeated 3+ times
try {
  // ... operation
} catch (err) {
  const errorMessage = err instanceof Error ? err.message : "알 수 없는 오류";
  console.error("Operation failed:", err);
}
```

**Recommendation:** Create error handler utility:
```typescript
// src/shared/utils/error-handler.ts
export function getErrorMessage(error: unknown, defaultMessage: string): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return defaultMessage;
}

export function logAndGetError(error: unknown, operation: string): string {
  const message = getErrorMessage(error, `${operation} failed`);
  console.error(`${operation}:`, error);
  return message;
}
```

---

### Component Complexity Issues

#### 1. Large Components
**Severity: MEDIUM**

| Component | Lines | Issues |
|-----------|-------|--------|
| ai-quiz-tab.tsx | 432 | Mixing state logic, rendering, UI |
| ai-recommendations-step.tsx | 391 | Too many responsibilities |
| learning-task-item.tsx | 350 | Complex nested JSX, date handling |
| completion-calendar-section.tsx | 329 | State management + UI logic |

**Example - ai-quiz-tab.tsx (lines 1-150):**
```typescript
export function AiQuizTab({ learningTaskId }: AiQuizTabProps) {
  // State management (8 variables)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  
  // Business logic (10+ variables)
  const quizStatus: LearningTaskQuizStatus = quizData?.status ?? "idle";
  const quizStatusMeta = AI_QUIZ_STATUS_META[quizStatus];
  const isQuizProcessing = quizStatus === "processing" || isGeneratePending;
  // ... 7 more computed values
  
  // Effects (2 useEffect hooks)
  useEffect(() => { /* synchronization */ }, [quizData]);
  
  // Event handlers (3 functions)
  const handleGenerateQuiz = async (force?: boolean) => {};
  
  // JSX (200+ lines)
  return <>{/* Complex JSX tree */}</>;
}
```

**Recommendation:** Split into smaller components:

```typescript
// Before: 432 lines in single component
// After: Split into:
- <AiQuizTab /> (coordinator) - 80 lines
  - <QuizStatus /> - 60 lines
  - <QuizGenerator /> - 100 lines
  - <QuizSolver /> - 150 lines
  - <QuizResults /> - 80 lines
```

---

## 3. PERFORMANCE OPTIMIZATION OPPORTUNITIES

### 1. Missing Memoization
**Severity: HIGH**
**Only 22 memoization instances in 69 files (32% coverage)**

#### Examples of Components That Need Memoization:

**learning-plan-card.tsx** - Rendered in list
```typescript
// ❌ CURRENT - Re-renders on every parent update
const LearningPlanCard: React.FC<LearningPlanCardProps> = ({
  learningPlan,
  className,
  ...props
}) => {
  const userLevelKey = learningPlan.userLevel as keyof UserLevelMapping;
  const slots = learningPlanCardVariants({ difficulty: userLevelKey });
  // ... JSX
};

// ✓ RECOMMENDED
const LearningPlanCard = React.memo(function LearningPlanCard({
  learningPlan,
  className,
  ...props
}: LearningPlanCardProps) {
  // ... same code
}, (prev, next) => {
  // Custom comparison for complex props
  return prev.learningPlan.id === next.learningPlan.id;
});
```

**learning-task-item.tsx** - Rendered in list (350 lines, nested callbacks)
```typescript
// ❌ CURRENT
const LearningTaskItem = ({
  learningTask,
  onToggleComplete,
  onUpdateDueDate,
  // ... props
}: LearningTaskItemProps) => {
  const handleOpenDetail = React.useCallback(() => { /* ... */ }, []);
  // Problem: callbacks recreated every render due to missing dependencies
};

// ✓ RECOMMENDED
const LearningTaskItem = React.memo(function LearningTaskItem({
  learningTask,
  onToggleComplete,
  onUpdateDueDate,
}: LearningTaskItemProps) {
  const handleOpenDetail = React.useCallback(() => {
    navigate({
      to: "/app/learning-plans/$learningPlanId/learning-tasks/$learningTaskId",
      params: { learningPlanId, learningTaskId: learningTask.id },
    });
  }, [navigate, learningPlanId, learningTask.id]);
  
  return (/* JSX */);
});

export { LearningTaskItem };
```

**LearningTaskDueDateMenu** - Nested component (100+ lines)
```typescript
// ❌ CURRENT - Recreated on every render
const LearningTaskDueDateMenu = ({
  dueDate,
  onSave,
  isDisabled = false,
}: LearningTaskDueDateMenuProps) => { /* ... */ };

// ✓ RECOMMENDED
const LearningTaskDueDateMenu = React.memo(function DueDateMenu({
  dueDate,
  onSave,
  isDisabled = false,
}: LearningTaskDueDateMenuProps) { /* ... */ });
```

---

### 2. No Code Splitting/Lazy Loading
**Severity: MEDIUM**

**Current:** All routes loaded upfront
```typescript
// No lazy loading configured
import { routeTree } from "@/routeTree.gen";
```

**Issue:** Even routes not immediately needed are bundled and loaded on init.

**Recommendation:** Configure TanStack Router for code splitting:
```typescript
// src/routes/app/create/index.tsx
import { lazy } from 'react';

const CreateRoute = lazy(() => import('./create-route'));

export const Route = createFileRoute('/app/create')({
  component: () => (
    <Suspense fallback={<LoadingPage />}>
      <CreateRoute />
    </Suspense>
  ),
});
```

Or use route-level code splitting:
```typescript
// vite.config.ts - already enabled via tanstackRouter
export default defineConfig({
  plugins: [
    tanstackRouter({ 
      target: "react", 
      autoCodeSplitting: true  // ✓ Already enabled
    }),
    // ...
  ],
});
```

**Status:** ✓ Already enabled but verify bundle output

---

### 3. Inefficient Query Patterns
**Severity: MEDIUM**

**Issue 1: Manual Refetch in Quiz Hook**
```typescript
// src/features/learning-plan/hooks/use-learning-task-quiz.ts
const quizQuery = useQuery({
  ...learningTaskQuizQueryOptions(learningTaskId),
  refetchInterval: (query) => {
    const status = query.state.data?.data?.status ?? "idle";
    return status === "processing" ? QUIZ_REFETCH_INTERVAL_MS : false;
  },
});
```

**Issue:** Polling-based instead of event-driven. While functional, could use WebSocket or SSE when available.

**Recommendation:** Add WebSocket support for real-time updates
```typescript
const useQuizPolling = (learningTaskId: string) => {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const ws = new WebSocket(`wss://api.example.com/quiz/${learningTaskId}`);
    ws.onmessage = (event) => {
      queryClient.invalidateQueries({
        queryKey: learningPlanKeys.learningTaskQuiz(learningTaskId),
      });
    };
    return () => ws.close();
  }, [learningTaskId, queryClient]);
};
```

**Issue 2: Multiple Query Keys for Same Data**
```typescript
// Inconsistent across features
["messages", conversationId]           // ai-chat
learningPlanKeys.learningTask(id)      // learning-plan
["conversations", learningPlanId]      // ai-chat
```

**Recommendation:** Use consistent QueryKey factory across all features

---

### 4. Large Bundle Impact

**Identified Heavy Dependencies:**
- `@tiptap/*` (rich text editor) - Check if all features used
- `@use-funnel/browser` - Only used in learning-plan-funnel
- `ai` + `@ai-sdk/react` - AI streaming (legitimate but worth monitoring)

**Recommendation:** Analyze bundle:
```bash
cd apps/web
npm run build
# Review dist/ output size
# Use vite-plugin-visualizer to see bundle breakdown
```

---

## 4. STATE MANAGEMENT PATTERNS

### Query Options Pattern - GOOD ✓

Proper implementation of query options factory:

```typescript
// src/features/learning-plan/api/learning-plan-queries.ts
export const learningPlansQueryOptions = (params?: LearningPlanListParams) =>
  queryOptions({
    queryKey: learningPlanKeys.list(params),
    queryFn: () => listLearningPlans(params),
  });

// Usage in components
const { data: learningPlans } = useLearningPlanList(params);
```

**Strengths:**
- Decoupled query logic from components
- Reusable query definitions
- Type-safe query keys

---

### Local State Management - MIXED ⚠️

**Good Pattern:**
```typescript
// src/features/ai-chat/components/ai-chat-section.tsx
const [selectedConversationId, setSelectedConversationId] = useState<string | null>(
  () => conversations[0]?.id ?? null
);
// Lazy initialization for computed state ✓
```

**Issues:**

1. **Over-reliance on useState for complex state**
   ```typescript
   // learning-task-item.tsx - Component with multiple interrelated states
   const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
   // + 7 more computed values
   // Better: useReducer for state machine
   ```

2. **Callback Props Without Memoization**
   ```typescript
   // learning-module-item.tsx receives:
   onToggleComplete?: (learningTaskId: string, isCompleted: boolean) => void;
   onUpdateDueDate?: (learningTaskId: string, dueDate: string | null) => void;
   
   // Without React.memo, always recreated
   ```

**Recommendation: Use useReducer for Complex State**
```typescript
type QuizState = 
  | { status: 'idle' }
  | { status: 'processing' }
  | { status: 'ready'; questions: Question[] }
  | { status: 'submitted'; result: QuizResult };

function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (state.status) {
    case 'idle':
      return action.type === 'START' ? { status: 'processing' } : state;
    case 'processing':
      if (action.type === 'READY') {
        return { status: 'ready', questions: action.questions };
      }
      return state;
    // ...
  }
}
```

---

## 5. UI/UX & ACCESSIBILITY

### React Aria Components Usage - GOOD ✓

Excellent use of React Aria for accessible components:
- `Calendar`, `CalendarCell`, `CalendarGrid` - Proper date picker
- `Popover`, `PopoverDialog`, `PopoverTrigger` - Accessible popover
- `Dialog`, `DialogTrigger`, `DialogContent` - Modal dialogs
- `Tab`, `TabList`, `TabPanel` - Tab navigation
- `Button` - Accessible buttons

**Example - Learning Task Due Date Menu:**
```typescript
<Button
  aria-label={learningTask.isCompleted ? "완료 해제" : "완료 표시"}
  data-prevent-learningTask-navigation="true"
>
  {/* ... */}
</Button>
```

---

### Accessibility Issues

#### 1. Limited ARIA Labels
**Severity: MEDIUM**
Only 13 accessibility attributes across codebase:

**Missing ARIA Labels:**
```typescript
// ❌ BAD - learning-plan-list.tsx
<Icon
  name="solar--book-minimalistic-outline"
  className="size-8 bg-muted-foreground rounded-full p-2"
/>

// ✓ GOOD
<Icon
  name="solar--book-minimalistic-outline"
  className="size-8 bg-muted-foreground rounded-full p-2"
  aria-label="학습 계획 아이콘"
/>
```

**Audit Required:**
- Link components - missing `aria-label` on icon-only links
- Icon buttons - not all have labels
- Form inputs - missing `aria-label` for accessibility

---

#### 2. Semantic HTML Issues

**Issue: Divs instead of Semantic Elements**
```typescript
// ❌ BAD - learning-plan-list.tsx:15-38
<div className="flex flex-col items-center justify-center py-12 text-center w-full">
  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
    <Icon type="iconify" />
  </div>
  <h3 className="text-lg font-semibold text-foreground mb-2">
    학습 계획이 없습니다
  </h3>
  <Link variant="secondary">
    학습 계획 만들기
  </Link>
</div>

// ✓ BETTER
<section className="flex flex-col items-center justify-center py-12 text-center w-full">
  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
    <Icon type="iconify" aria-hidden="true" />
  </div>
  <h2 className="text-lg font-semibold text-foreground mb-2">
    학습 계획이 없습니다
  </h2>
  <Link variant="secondary">
    학습 계획 만들기
  </Link>
</section>
```

---

#### 3. Error Messages Not Announced
```typescript
// No role="alert" or aria-live regions
{generateErrorMessage && (
  <div className="rounded-md border border-destructive-40 ...">
    {generateErrorMessage}
  </div>
)}

// ✓ SHOULD BE
{generateErrorMessage && (
  <div 
    className="rounded-md border border-destructive-40 ..."
    role="alert"
    aria-live="polite"
  >
    {generateErrorMessage}
  </div>
)}
```

---

### Loading & Error States - GOOD ✓

**Good Pattern - Learning Task Detail:**
```typescript
if (learningTask.isLoading) {
  return <LoadingState />;
}

if (learningTask.isError || !learningTask.data?.data) {
  return <ErrorState error={learningTask.error} />;
}

return <Content data={learningTask.data.data} />;
```

---

## 6. ERROR HANDLING

### Current Approach: Minimal

**Issues:**

1. **No Global Error Boundary**
   - No error boundary at app level
   - Errors propagate to React without catching
   
2. **No Centralized Error Logger**
   ```typescript
   console.error("대화 생성 실패:", error);  // Multiple scattered
   ```

3. **No Error Recovery Strategy**
   ```typescript
   // Only shows error, no retry mechanism
   if (learningTask.isError) {
     return <ErrorState />;  // No retry button
   }
   ```

**Recommendation: Add Error Boundary**
```typescript
// src/shared/components/error-boundary.tsx
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to monitoring service
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}

// Usage in main.tsx
<ErrorBoundary>
  <TanStackQueryProvider>
    <AuthProvider>
      <InnerApp />
    </AuthProvider>
  </TanStackQueryProvider>
</ErrorBoundary>
```

---

## 7. TESTING & CI/CD

### Current Status: No Tests Found
- No test files in `/src/__tests__` or `.test.ts` files
- jest, vitest, etc. configured but not utilized

**Recommendation:** Implement testing strategy:

```typescript
// src/features/learning-plan/__tests__/learning-plan-list.test.tsx
import { render, screen } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { LearningPlanList } from '../learning-plan-list';

describe('LearningPlanList', () => {
  it('renders empty state when no plans', () => {
    // ...
  });

  it('renders list of plans', () => {
    // ...
  });
});
```

---

## 8. SPECIFIC RECOMMENDATIONS

### High Priority (Do First)

1. **Remove Hardcoded URLs**
   ```
   File: src/api/http-client.ts, src/features/ai-chat/hooks/use-ai-chat.ts
   Impact: Enable environment-specific configuration
   Effort: 30 minutes
   ```

2. **Remove Console Statements**
   ```
   Files: 8 instances across codebase
   Effort: 15 minutes
   ```

3. **Add React.memo to List Items**
   ```
   Files: LearningPlanCard, LearningTaskItem, LearningModuleItem
   Impact: Prevent unnecessary re-renders in lists
   Effort: 1 hour
   ```

4. **Extract Duplicate Date Formatting**
   ```
   Create: src/shared/utils/date-formatter.ts
   Effort: 20 minutes
   ```

### Medium Priority (Next Sprint)

5. **Split Large Components**
   - ai-quiz-tab.tsx (432 lines)
   - ai-recommendations-step.tsx (391 lines)
   - learning-task-item.tsx (350 lines)
   ```
   Effort: 2-3 hours
   ```

6. **Add Query Key Factory Consistency**
   - Unify `["conversations", id]` style with `conversationKeys.detail(id)`
   ```
   Effort: 1 hour
   ```

7. **Add Error Boundary at App Root**
   ```
   Effort: 1 hour
   ```

8. **Improve Accessibility**
   - Add missing `aria-label` attributes
   - Add `role="alert"` to error messages
   - Use semantic HTML
   ```
   Effort: 2 hours
   ```

### Low Priority (Polish)

9. **Add Test Coverage**
   - Start with critical paths
   - 50% coverage target
   ```
   Effort: 4-6 hours
   ```

10. **Monitor Bundle Size**
    - Add bundle analyzer
    - Set size budgets
    ```
    Effort: 30 minutes
    ```

11. **Use useReducer for Complex State**
    - ai-quiz-tab.tsx state management
    ```
    Effort: 1 hour
    ```

---

## 9. SUMMARY TABLE

| Category | Rating | Status |
|----------|--------|--------|
| Architecture | ⭐⭐⭐⭐ | Good - Feature-based, clear separation |
| Code Quality | ⭐⭐⭐ | Fair - Duplication, hardcoded values |
| Performance | ⭐⭐⭐ | Fair - Missing memoization, no code splitting |
| State Management | ⭐⭐⭐⭐ | Good - TanStack Query well-used |
| UI/Accessibility | ⭐⭐⭐ | Fair - React Aria used, but limited ARIA labels |
| Error Handling | ⭐⭐ | Poor - No error boundaries, scattered handling |
| TypeScript Safety | ⭐⭐⭐ | Fair - 10 type bypasses, mostly safe |
| Testing | ⭐ | None - No test files |

---

## 10. FILES REFERENCE

**Key Architecture Files:**
- `src/main.tsx` - App entry point
- `src/app/router.ts` - Router configuration
- `src/routes/__root.tsx` - Root route with devtools
- `src/features/auth/context/auth-context.tsx` - Auth state
- `src/app/providers/query-client.tsx` - React Query setup

**Files Needing Attention:**
- `src/api/http-client.ts` - Hardcoded URL
- `src/features/ai-chat/hooks/use-ai-chat.ts` - Hardcoded endpoint, console.log
- `src/routes/app/learning-plans/$learningPlanId/learning-tasks/components/ai-quiz-tab.tsx` - Too large (432 lines)
- `src/features/learning-plan/components/learning-task-item.tsx` - Needs memoization (350 lines)

