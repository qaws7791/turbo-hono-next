# Web Frontend 코드 품질 분석 보고서

**분석 기준**: CLAUDE.md 가이드라인
**분석 일자**: 2025-11-17
**전체 평가**: B (좋은 기반, 상태 관리 및 폼 처리 개선 필요)

---

## 📊 요약

Web Frontend는 TanStack Query, React Aria Components, 그리고 Router 사용 측면에서 우수한 구현을 보여줍니다. 그러나 **상태 관리 패턴과 폼 처리**가 CLAUDE.md 가이드라인과 일치하지 않으며, 하드코딩된 설정값들이 프로덕션 배포를 위해 개선되어야 합니다.

### 주요 지표

| 카테고리 | 현황 |
|----------|------|
| **상태 관리** | ⚠️ Auth에 Zustand 미사용 |
| **폼 처리** | ⚠️ React Hook Form + Zod 미사용 |
| **API 통합** | ❌ 하드코딩된 URL, 불일치하는 포트 |
| **라우터 사용** | ✅ TanStack Router 올바르게 사용 |
| **타입 안정성** | ✅ any 타입 없음, strict mode |
| **컴포넌트 개발** | ✅ React Aria Components 사용 |
| **코드 품질** | ⚠️ Console.log, alert() 사용 |

---

## 🔴 중대 이슈 (Critical)

### 1. 인증 상태 관리가 Zustand 미사용

**파일**: `src/features/auth/context/auth-context.tsx`
**라인**: 37-38, 62-78
**가이드라인 위반**: "Client UI state: Zustand stores (modals, theme, user preferences)"

#### 현재 구현 (위반)

```typescript
// ❌ useState 사용
const [user, setUser] = useState<AuthUser | null>(null);
const [isLoading, setIsLoading] = useState(true);
```

#### 문제점
- 인증 상태는 클라이언트 UI 상태로서 Zustand로 관리되어야 함
- Context API는 불필요한 리렌더링을 발생시킬 수 있음
- Zustand는 더 나은 DevTools 지원과 미들웨어 기능 제공

#### 권장 해결책

```typescript
// ✅ Zustand store 생성
// src/stores/auth-store.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface AuthStore {
  user: AuthUser | null;
  isLoading: boolean;
  setUser: (user: AuthUser | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        isLoading: true,
        setUser: (user) => set({ user }),
        setIsLoading: (isLoading) => set({ isLoading }),
        logout: () => set({ user: null }),
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({ user: state.user }), // 필요한 것만 persist
      }
    )
  )
);
```

```typescript
// 사용법
import { useAuthStore } from '@/stores/auth-store';

function Component() {
  const { user, isLoading } = useAuthStore();
  // Context Provider 제거 가능
}
```

---

### 2. 하드코딩된 API URL

**파일**: `src/api/http-client.ts`
**라인**: 16, 417
**심각도**: CRITICAL

#### 현재 구현 (위반)

```typescript
// ❌ 하드코딩된 baseUrl
const client = createClient<paths>({
  baseUrl: "http://localhost:3999",
  credentials: "include",
});
```

#### 문제점
- 프로덕션 배포 시 URL 변경 불가
- 환경별 설정 불가 (dev, staging, prod)
- 보안상 취약점 (하드코딩된 민감 정보)

#### 권장 해결책

```typescript
// ✅ 환경 변수 사용
const client = createClient<paths>({
  baseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:3999",
  credentials: "include",
});
```

```bash
# .env.development
VITE_API_BASE_URL=http://localhost:3999

# .env.production
VITE_API_BASE_URL=https://api.yourdomain.com
```

#### 추가 위반 위치
- `src/api/http-client.ts:417` - aiChat.streamMessage
- `src/features/ai-chat/hooks/use-ai-chat.ts:28`
- `src/features/ai-chat/components/chatbot.tsx:37`

---

### 3. 불일치하는 API 포트 번호

**심각도**: HIGH
**영향**: 런타임 오류 가능성

#### 발견된 불일치

| 파일 | 라인 | 포트 |
|------|------|------|
| `http-client.ts` (main) | 16 | 3999 |
| `http-client.ts` (aiChat) | 417 | 3001 |
| `use-ai-chat.ts` | 28 | 3001 |
| `chatbot.tsx` | 37 | 3999 |

#### 권장 해결책

모든 위치에서 동일한 환경 변수 사용:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3999";

// 모든 API 호출에서 사용
fetch(`${API_BASE_URL}/api/...`);
```

---

## 🟠 높은 우선순위 이슈 (High)

### 4. 폼 상태 관리가 React Hook Form + Zod 미사용

**가이드라인 위반**: "Form validation: React Hook Form + Zod for complex forms"

#### 4.1 로그인 폼

**파일**: `src/routes/login/index.tsx`
**라인**: 36-38

**현재 구현 (위반)**:
```typescript
// ❌ useState로 폼 상태 관리
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [isLoading, setIsLoading] = useState(false);
```

**권장 수정**:
```typescript
// ✅ React Hook Form + Zod
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('유효한 이메일을 입력하세요'),
  password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다'),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    // 타입 안전한 폼 데이터
    await loginMutation.mutateAsync(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextField
        {...register('email')}
        error={errors.email?.message}
      />
      <TextField
        {...register('password')}
        type="password"
        error={errors.password?.message}
      />
      <Button type="submit" isDisabled={isSubmitting}>
        로그인
      </Button>
    </form>
  );
}
```

#### 4.2 회원가입 폼

**파일**: `src/routes/signup/index.tsx`
**라인**: 36-40
**동일한 이슈**: useState 대신 React Hook Form + Zod 사용 필요

#### 4.3 학습 계획 수동 입력 폼

**파일**: `src/features/learning-plan/components/learning-plan-funnel/steps/manual-input-step.tsx`
**라인**: 55-64
**동일한 이슈**: 복잡한 폼이므로 React Hook Form + Zod 필수

---

### 5. alert() 사용 대신 Toast UI 컴포넌트

**파일**: `src/shared/components/file-upload.tsx`
**라인**: 27, 37, 43
**심각도**: HIGH

#### 현재 구현 (위반)

```typescript
// ❌ 브라우저 네이티브 alert
if (documents.length >= maxFiles) {
  alert(`최대 ${maxFiles}개의 파일만 업로드할 수 있습니다.`);
  return;
}

if (file.size > maxFileSize) {
  alert(`파일 크기는 최대 ${maxFileSize / (1024 * 1024)}MB까지 가능합니다.`);
  continue;
}

if (!acceptedTypes.includes(file.type)) {
  alert("지원하지 않는 파일 형식입니다.");
  continue;
}
```

#### 문제점
- 나쁜 UX (모달 차단, 구식 디자인)
- 접근성 문제
- 커스터마이징 불가
- 현대적인 React UI 패턴과 불일치

#### 권장 해결책

Toast 시스템 구현:

```typescript
// ✅ Toast 알림 사용
import { useToast } from '@/hooks/use-toast';

function FileUpload() {
  const toast = useToast();

  const handleFiles = (files: File[]) => {
    if (documents.length >= maxFiles) {
      toast.error(`최대 ${maxFiles}개의 파일만 업로드할 수 있습니다.`);
      return;
    }

    for (const file of files) {
      if (file.size > maxFileSize) {
        toast.warning(
          `${file.name}: 파일 크기는 최대 ${maxFileSize / (1024 * 1024)}MB까지 가능합니다.`
        );
        continue;
      }

      if (!acceptedTypes.includes(file.type)) {
        toast.warning(`${file.name}: 지원하지 않는 파일 형식입니다.`);
        continue;
      }
    }
  };
}
```

Toast Hook 구현 예시:

```typescript
// src/hooks/use-toast.ts
import { create } from 'zustand';

interface Toast {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (type: Toast['type'], message: string) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (type, message) => {
    const id = Math.random().toString(36);
    set((state) => ({
      toasts: [...state.toasts, { id, type, message }],
    }));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 5000);
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

export const useToast = () => {
  const addToast = useToastStore((state) => state.addToast);
  return {
    info: (message: string) => addToast('info', message),
    success: (message: string) => addToast('success', message),
    warning: (message: string) => addToast('warning', message),
    error: (message: string) => addToast('error', message),
  };
};
```

---

## 🟡 중간 우선순위 이슈 (Medium)

### 6. console.log 사용

**심각도**: MEDIUM
**영향**: 프로덕션 로그 오염, 디버그 정보 노출

#### 발견된 위치

| 파일 | 라인 | 용도 |
|------|------|------|
| `use-ai-chat.ts` | 25 | 디버그 로깅 |
| `chatbot.tsx` | 45, 48 | 디버그 로깅 |
| `learning-plan-funnel/index.tsx` | 41 | 디버그 로깅 |

#### 권장 해결책

1. **개발 환경**: 조건부 로깅
```typescript
if (import.meta.env.DEV) {
  console.log('Debug info:', data);
}
```

2. **프로덕션**: 완전 제거 또는 로깅 라이브러리 사용
```typescript
// Vite 빌드 시 자동 제거
if (__DEV__) {
  console.log('Debug info:', data);
}
```

3. **모니터링**: Sentry 등의 에러 트래킹 도구 사용

---

### 7. 중복 상태 관리 (Chatbot)

**파일**: `src/features/ai-chat/components/chatbot.tsx`
**라인**: 34, 61, 127
**심각도**: MEDIUM

#### 문제점

```typescript
// input 상태를 관리하지만 PromptInputTextarea가 자체 상태를 가질 수 있음
const [input, setInput] = useState("");

<PromptInputTextarea
  onChange={(e) => setInput(e.target.value)}
  value={input}
/>
```

#### 조사 필요
- `PromptInputTextarea`가 제어 컴포넌트인지 비제어 컴포넌트인지 확인
- 필요한 경우 제어 컴포넌트로 통일
- 불필요한 경우 중복 상태 제거

---

### 8. 명시적 반환 타입 누락

**파일**: 여러 hook 파일들
**심각도**: MEDIUM
**가이드라인 위반**: "Type Safety: explicit return types"

#### 예시 위반

```typescript
// ❌ 반환 타입 없음
export function useLearningPlanList(params?: LearningPlanListParams) {
  return useSuspenseQuery(learningPlansQueryOptions(params));
}

// ✅ 명시적 반환 타입
export function useLearningPlanList(
  params?: LearningPlanListParams
): UseSuspenseQueryResult<LearningPlanListResponse> {
  return useSuspenseQuery(learningPlansQueryOptions(params));
}
```

#### 권장 해결책

모든 커스텀 hooks와 함수에 명시적 반환 타입 추가

---

### 9. 하드코딩된 옵션 배열

**파일**: `src/features/learning-plan/components/learning-plan-funnel/steps/manual-input-step.tsx`
**라인**: 36-52
**심각도**: MEDIUM

#### 현재 구현 (위반)

```typescript
const userLevelOptions = ["초보자", "기초", "중급", "고급", "전문가"] as const;
const learningStyleOptions = [
  "시각적 학습",
  "실습 중심",
  "이론 중심",
  "프로젝트 기반",
] as const;
```

#### 문제점
- DRY 원칙 위반 (다른 곳에서도 사용 가능)
- API 스키마와 불일치 가능성
- 유지보수 어려움

#### 권장 해결책

```typescript
// src/features/learning-plan/constants.ts
export const USER_LEVEL_OPTIONS = [
  "초보자",
  "기초",
  "중급",
  "고급",
  "전문가",
] as const;

export const USER_LEVEL_MAP = {
  beginner: "초보자",
  basic: "기초",
  intermediate: "중급",
  advanced: "고급",
  expert: "전문가",
} as const;

export type UserLevel = keyof typeof USER_LEVEL_MAP;
```

---

### 10. ErrorBoundary 미사용

**심각도**: MEDIUM
**가이드라인 위반**: "Defensive Programming: use ErrorBoundary"

#### 현황

Route 파일들에서 ErrorBoundary 사용 증거가 부족합니다.

#### 권장 해결책

```typescript
// src/components/error-boundary.tsx
import { useRouteError } from '@tanstack/react-router';

export function ErrorBoundary() {
  const error = useRouteError();

  return (
    <div className="error-container">
      <h1>오류가 발생했습니다</h1>
      <p>{error instanceof Error ? error.message : '알 수 없는 오류'}</p>
    </div>
  );
}
```

```typescript
// 각 route 파일에서
export const Route = createFileRoute("/app/")({
  errorComponent: ErrorBoundary,
  // ...
});
```

---

## 🟢 낮은 우선순위 이슈 (Low)

### 11. FormData 타입 단언

**파일**: `src/api/http-client.ts`
**라인**: 276
**심각도**: LOW

```typescript
body: formData as unknown as DocumentUploadBody,
```

이는 openapi-fetch의 FormData 지원 제한 때문이므로 허용 가능하지만, 주석으로 이유를 설명하는 것이 좋습니다:

```typescript
// openapi-fetch doesn't support FormData properly yet
// See: https://github.com/drwpow/openapi-typescript/issues/xxx
body: formData as unknown as DocumentUploadBody,
```

---

## ✅ 긍정적인 발견사항

### 강점

1. **TanStack Query 사용** ✅
   - 서버 상태를 올바르게 TanStack Query로 관리
   - 우수한 쿼리 키 팩토리 패턴
   - Suspense 모드 활용

2. **React Aria Components** ✅
   - 접근성이 뛰어난 컴포넌트 사용
   - 일관된 UI 패턴
   - 적절한 컴포넌트 추상화

3. **Router 사용** ✅
   - TanStack Router 파일 기반 라우팅 올바르게 사용
   - 인증 가드 (beforeLoad) 적절히 구현
   - Zod를 사용한 검색 파라미터 검증

4. **타입 안정성** ✅
   - 사용자 코드에 `any` 타입 없음
   - 생성된 OpenAPI 타입 사용
   - TypeScript strict mode 준수

5. **컴포넌트 구조** ✅
   - features/ 디렉토리에 기능별 조직화
   - 적절한 파일 네이밍 (kebab-case, PascalCase)
   - 좋은 코드 분리

6. **불변성** ✅
   - const 사용
   - 부작용 최소화

---

## 🎯 우선순위별 권장사항

### 즉시 실행 (이번 스프린트)

1. ✅ API URL을 환경 변수로 이동
2. ✅ 인증 상태를 위한 Zustand store 생성
3. ✅ 포트 번호 불일치 해결

### 높은 우선순위 (이번 스프린트)

4. ✅ 로그인/회원가입 폼을 React Hook Form + Zod로 마이그레이션
5. ✅ alert()를 Toast 알림으로 교체
6. ✅ console.log 구문 제거

### 중간 우선순위 (다음 스프린트)

7. ✅ ErrorBoundary 컴포넌트 추가
8. ✅ 하드코딩된 상수들을 constants 파일로 통합
9. ✅ 모든 hooks에 명시적 반환 타입 추가
10. ✅ Chatbot 중복 상태 조사 및 리팩토링

### 낮은 우선순위 (백로그)

11. ✅ 타입 단언에 주석으로 이유 문서화
12. ✅ DRY 위반 리팩토링 (USER_LEVEL_MAP 등)

---

## 📁 파일별 상세 이슈 목록

### 상태 관리 위반

| 파일 | 라인 | 이슈 | 심각도 |
|------|------|------|--------|
| `auth-context.tsx` | 37-38, 62-78 | Zustand 대신 useState 사용 | Critical |
| `login/index.tsx` | 36-38 | React Hook Form 미사용 | High |
| `signup/index.tsx` | 36-40 | React Hook Form 미사용 | High |
| `manual-input-step.tsx` | 55-64 | React Hook Form 미사용 | High |

### API 통합 위반

| 파일 | 라인 | 이슈 | 심각도 |
|------|------|------|--------|
| `http-client.ts` | 16 | 하드코딩된 URL (3999) | Critical |
| `http-client.ts` | 417 | 하드코딩된 URL (3001) | Critical |
| `use-ai-chat.ts` | 28 | 하드코딩된 URL (3001) | Critical |
| `chatbot.tsx` | 37 | 하드코딩된 URL (3999) | Critical |

### 코드 품질

| 파일 | 라인 | 이슈 | 심각도 |
|------|------|------|--------|
| `file-upload.tsx` | 27, 37, 43 | alert() 사용 | High |
| `use-ai-chat.ts` | 25 | console.log | Medium |
| `chatbot.tsx` | 45, 48 | console.log | Medium |
| `learning-plan-funnel/index.tsx` | 41 | console.log | Medium |
| `chatbot.tsx` | 34, 61, 127 | 중복 상태 | Medium |
| `use-learning-plan-list.ts` | 7 | 반환 타입 누락 | Medium |
| `manual-input-step.tsx` | 36-52 | 하드코딩된 옵션 | Medium |

---

## 📚 마이그레이션 가이드

### 1. Zustand Store 설정

```bash
# 필요한 패키지 설치
pnpm add zustand
```

```typescript
// src/stores/auth-store.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface AuthStore {
  user: AuthUser | null;
  isLoading: boolean;
  setUser: (user: AuthUser | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  devtools((set) => ({
    user: null,
    isLoading: true,
    setUser: (user) => set({ user }),
    setIsLoading: (isLoading) => set({ isLoading }),
    logout: () => set({ user: null }),
  }))
);
```

### 2. React Hook Form 설정

```bash
# 필요한 패키지 설치
pnpm add react-hook-form @hookform/resolvers zod
```

```typescript
// src/features/auth/schemas/login.schema.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('유효한 이메일을 입력하세요'),
  password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
```

### 3. Toast 시스템 설정

```typescript
// src/stores/toast-store.ts
import { create } from 'zustand';

interface Toast {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (type: Toast['type'], message: string) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (type, message) => {
    const id = Math.random().toString(36);
    set((state) => ({
      toasts: [...state.toasts, { id, type, message }],
    }));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 5000);
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
```

---

## 📖 추가 읽기 자료

- [Zustand 공식 문서](https://zustand.docs.pmnd.rs/)
- [React Hook Form + Zod](https://react-hook-form.com/get-started#SchemaValidation)
- [TanStack Query Best Practices](https://tanstack.com/query/latest/docs/react/guides/queries)
- [React Aria Components](https://react-spectrum.adobe.com/react-aria/components.html)

---

**최종 업데이트**: 2025-11-17
**다음 리뷰**: 리팩토링 완료 후
