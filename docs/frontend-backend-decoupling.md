# 프론트엔드-백엔드 결합도 완화 아키텍처 개선안

## 목차

1. [현재 아키텍처 분석](#1-현재-아키텍처-분석)
2. [문제점 및 개선 목표](#2-문제점-및-개선-목표)
3. [제안 아키텍처](#3-제안-아키텍처)
4. [구체적 개선 방안](#4-구체적-개선-방안)
5. [마이그레이션 전략](#5-마이그레이션-전략)
6. [기대 효과](#6-기대-효과)

---

## 1. 현재 아키텍처 분석

### 1.1 현재 구조

```
┌─────────────────────────────────────────────────────────┐
│                     apps/web                            │
│  ┌──────────────────────────────────────────────────┐  │
│  │  features/*/hooks/                               │  │
│  │  - React Query hooks                             │  │
│  │  - API 타입에 직접 의존                            │  │
│  └──────────────────┬───────────────────────────────┘  │
│                     │ 직접 참조                          │
│  ┌──────────────────▼───────────────────────────────┐  │
│  │  api/http-client.ts                              │  │
│  │  - 40+ API 함수                                   │  │
│  │  - openapi-fetch 직접 사용                        │  │
│  │  - API 타입 그대로 반환                            │  │
│  └──────────────────┬───────────────────────────────┘  │
│                     │                                    │
│  ┌──────────────────▼───────────────────────────────┐  │
│  │  api/schema.ts (자동 생성)                        │  │
│  │  - paths 타입                                     │  │
│  │  - components 타입                                │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTP
                      ▼
            packages/api-spec → apps/api
```

### 1.2 현재 결합 지점

#### 1.2.1 도메인 로직이 API 타입에 직접 의존

```typescript
// features/learning-plan/hooks/use-learning-plans.ts
import { api } from "@/api/http-client";
import type { paths } from "@/api/schema";

// API 응답 타입을 직접 사용
type ApiResponse = paths["/plans"]["get"]["responses"][200]["content"]["application/json"];

export function useLearningPlans() {
  return useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const response = await api.learningPlans.list();
      // API 응답 구조를 그대로 사용
      return response.data;
    },
  });
}
```

**문제점**:
- 백엔드 API 응답 구조 변경 시 Feature 코드 영향
- 도메인 로직이 API 계층에 강하게 결합
- 비즈니스 개념과 API 구조가 1:1 매핑

#### 1.2.2 에러 처리 분산

```typescript
// Feature A
const { data, error } = await api.learningPlans.list();
if (error) {
  if (error.status === 401) {
    // 각자 다른 처리
  }
}

// Feature B - 중복된 에러 처리 로직
const { data, error } = await api.auth.login();
if (error) {
  if (error.status === 401) {
    // 동일한 로직 반복
  }
}
```

**문제점**:
- 에러 처리 로직 중복
- 일관성 없는 에러 처리
- 각 Feature에서 openapi-fetch 응답 구조 이해 필요

#### 1.2.3 40+ API 함수가 한 파일에 집중

```typescript
// api/http-client.ts
export const api = {
  auth: { login, signup, logout, me, changePassword },
  learningPlans: { list, detail, create, update, delete, updateStatus },
  learningModules: { create, update, delete, reorder },
  learningTasks: { create, detail, update, delete, move, getNote, getQuiz, submitQuiz },
  progress: { daily },
  documents: { upload, detail },
  ai: { getPlanRecommendations, generateLearningPlan, generateLearningTaskNote, ... },
  aiChat: { getConversations, getMessages, createConversation, ... },
};
```

**문제점**:
- 단일 파일이 너무 비대함 (440줄)
- 도메인별 응집도 낮음
- 테스트 및 유지보수 어려움

---

## 2. 문제점 및 개선 목표

### 2.1 핵심 문제

| 문제 | 영향 | 우선순위 |
|------|------|----------|
| **API 타입 직접 의존** | 백엔드 변경 시 Feature 영향 | 높음 |
| **에러 처리 중복** | 코드 중복, 일관성 부족 | 높음 |
| **단일 파일 비대화** | 유지보수 어려움 | 중간 |
| **도메인 개념 부재** | 비즈니스 로직 표현 제약 | 중간 |

### 2.2 개선 목표

#### 목표 1: 도메인 모델 분리
- API 응답 구조와 독립적인 비즈니스 엔티티 정의
- Feature는 도메인 모델에만 의존

#### 목표 2: 에러 처리 표준화
- 일관된 에러 처리 메커니즘
- Feature 코드에서 에러 처리 로직 중복 제거

#### 목표 3: 도메인별 모듈화
- API 함수를 도메인별로 분리
- 각 도메인 모듈이 독립적으로 관리 가능

### 2.3 비목표 (과도한 복잡성 회피)

- ❌ 새로운 패키지 추가
- ❌ HTTP 클라이언트 추상화 (openapi-fetch 그대로 사용)
- ❌ Mock 데이터/서비스 구현
- ❌ 복잡한 DI 컨테이너
- ❌ 과도한 레이어 추가

---

## 3. 제안 아키텍처

### 3.1 개선된 구조

```
┌─────────────────────────────────────────────────────────┐
│                     apps/web                            │
│                                                           │
│  ┌──────────────────────────────────────────────────┐  │
│  │  features/*/hooks/                               │  │
│  │  - React Query hooks                             │  │
│  │  - 도메인 모델에만 의존                            │  │
│  └──────────────────┬───────────────────────────────┘  │
│                     │ 도메인 모델                        │
│  ┌──────────────────▼───────────────────────────────┐  │
│  │  api/services/ (새로 추가)                        │  │
│  │  ├── learning-plan/                              │  │
│  │  │   ├── types.ts (도메인 모델)                  │  │
│  │  │   ├── api.ts (API 호출 + 변환)                │  │
│  │  │   └── mappers.ts (API ↔ 도메인)              │  │
│  │  ├── auth/                                       │  │
│  │  └── ...                                         │  │
│  └──────────────────┬───────────────────────────────┘  │
│                     │ openapi-fetch 사용                │
│  ┌──────────────────▼───────────────────────────────┐  │
│  │  api/client.ts (간단한 래퍼)                      │  │
│  │  - createClient 싱글톤                           │  │
│  │  - 에러 처리 유틸                                 │  │
│  └──────────────────┬───────────────────────────────┘  │
│                     │ 타입 참조                          │
│  ┌──────────────────▼───────────────────────────────┐  │
│  │  api/schema.ts (기존 유지)                        │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 3.2 핵심 설계 원칙

#### 원칙 1: 도메인 모델 우선

```typescript
// api/services/learning-plan/types.ts

// 도메인 모델 - 비즈니스 개념 표현
export interface LearningPlan {
  id: string;
  title: string;
  emoji?: string;
  description?: string;
  status: LearningPlanStatus;
  settings: LearningPlanSettings;
  createdAt: Date;
  updatedAt: Date;
}

export type LearningPlanStatus = "active" | "archived";

export interface LearningPlanSettings {
  topic: string;
  level: UserLevel;
  duration: {
    weeks: number;
    hoursPerWeek: number;
  };
  preferences: {
    style: string;
    resources: string;
  };
  goal: string;
  additionalNotes?: string;
}

export type UserLevel = "beginner" | "basic" | "intermediate" | "advanced" | "expert";

// API 입력 - 생성/수정에 필요한 데이터
export interface CreateLearningPlanInput {
  title: string;
  emoji?: string;
  description?: string;
  settings: LearningPlanSettings;
}
```

**특징**:
- ✅ 백엔드 API 구조와 독립적
- ✅ 비즈니스 개념 명확하게 표현
- ✅ 도메인 용어 사용

#### 원칙 2: 명확한 변환 경계

```typescript
// api/services/learning-plan/mappers.ts
import type { paths } from "@/api/schema";
import type { LearningPlan, LearningPlanSettings } from "./types";

type ApiLearningPlan = paths["/plans"]["get"]["responses"][200]["content"]["application/json"]["data"][number];

export function toLearningPlan(apiData: ApiLearningPlan): LearningPlan {
  return {
    id: apiData.id,
    title: apiData.title,
    emoji: apiData.emoji,
    description: apiData.description,
    status: apiData.status,
    settings: {
      topic: apiData.learningTopic,
      level: apiData.userLevel,
      duration: {
        weeks: apiData.targetWeeks,
        hoursPerWeek: apiData.weeklyHours,
      },
      preferences: {
        style: apiData.learningStyle,
        resources: apiData.preferredResources,
      },
      goal: apiData.mainGoal,
      additionalNotes: apiData.additionalRequirements ?? undefined,
    },
    createdAt: new Date(apiData.createdAt),
    updatedAt: new Date(apiData.updatedAt),
  };
}

export function toApiCreateRequest(input: CreateLearningPlanInput) {
  return {
    title: input.title,
    emoji: input.emoji,
    description: input.description,
    learningTopic: input.settings.topic,
    userLevel: input.settings.level,
    targetWeeks: input.settings.duration.weeks,
    weeklyHours: input.settings.duration.hoursPerWeek,
    learningStyle: input.settings.preferences.style,
    preferredResources: input.settings.preferences.resources,
    mainGoal: input.settings.goal,
    additionalRequirements: input.settings.additionalNotes ?? null,
  };
}
```

**특징**:
- ✅ API 구조 변경 시 매퍼만 수정
- ✅ Feature 코드는 변경 불필요
- ✅ 타입 안전한 변환

#### 원칙 3: openapi-fetch 직접 사용

```typescript
// api/client.ts
import createClient from "openapi-fetch";
import type { paths } from "./schema";

export const apiClient = createClient<paths>({
  baseUrl: import.meta.env.VITE_API_URL,
  credentials: "include",
});

// 에러 처리 유틸만 제공
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function handleApiError(error: unknown): ApiError {
  if (typeof error === "object" && error !== null && "status" in error) {
    const status = (error as { status: number }).status;
    return new ApiError(
      getErrorMessage(status),
      status,
      `HTTP_${status}`,
    );
  }
  return new ApiError("알 수 없는 오류가 발생했습니다");
}

function getErrorMessage(status: number): string {
  switch (status) {
    case 401: return "로그인이 필요합니다";
    case 403: return "권한이 없습니다";
    case 404: return "요청한 리소스를 찾을 수 없습니다";
    case 422: return "입력값을 확인해주세요";
    case 500: return "서버 오류가 발생했습니다";
    default: return "요청 처리 중 오류가 발생했습니다";
  }
}
```

**특징**:
- ✅ openapi-fetch 그대로 사용
- ✅ 추가 추상화 없음
- ✅ 간단한 에러 처리만 제공

---

## 4. 구체적 개선 방안

### 4.1 디렉토리 구조

```
apps/web/src/api/
├── schema.ts                        # 자동 생성 (기존 유지)
├── client.ts                        # openapi-fetch + 에러 처리
└── services/                        # 도메인별 모듈
    ├── learning-plan/
    │   ├── types.ts                 # 도메인 모델
    │   ├── mappers.ts               # API ↔ 도메인 변환
    │   ├── api.ts                   # API 호출 함수
    │   └── index.ts                 # Public API
    ├── auth/
    │   ├── types.ts
    │   ├── mappers.ts
    │   ├── api.ts
    │   └── index.ts
    ├── ai/
    ├── progress/
    └── documents/
```

**변경 최소화**:
- ✅ 기존 `schema.ts`, `http-client.ts` 유지 (점진적 마이그레이션)
- ✅ 새 디렉토리만 추가
- ✅ Feature 코드는 순차적으로 마이그레이션

### 4.2 도메인 모델 정의

**services/learning-plan/types.ts**
```typescript
/**
 * 학습 계획 도메인 모델
 *
 * 백엔드 API 구조와 독립적으로 비즈니스 개념을 표현합니다.
 * API 응답의 flat한 구조를 의미 있는 계층 구조로 재구성합니다.
 */

export interface LearningPlan {
  id: string;
  title: string;
  emoji?: string;
  description?: string;
  status: LearningPlanStatus;
  settings: LearningPlanSettings;
  timestamps: {
    createdAt: Date;
    updatedAt: Date;
  };
}

export type LearningPlanStatus = "active" | "archived";

export interface LearningPlanSettings {
  topic: string;
  level: UserLevel;
  duration: Duration;
  preferences: Preferences;
  goal: string;
  additionalNotes?: string;
}

export type UserLevel = "beginner" | "basic" | "intermediate" | "advanced" | "expert";

export interface Duration {
  weeks: number;
  hoursPerWeek: number;
}

export interface Preferences {
  style: LearningStyle;
  resources: ResourceType;
}

export type LearningStyle = "visual" | "hands-on" | "reading" | "video" | "interactive" | "project-based";
export type ResourceType = "online-course" | "book" | "tutorial" | "youtube" | "docs" | "practice-site";

// 입력 타입
export interface CreateLearningPlanInput {
  title: string;
  emoji?: string;
  description?: string;
  settings: LearningPlanSettings;
}

export interface UpdateLearningPlanInput {
  title?: string;
  emoji?: string;
  description?: string;
  settings?: Partial<LearningPlanSettings>;
}

// 쿼리 파라미터
export interface ListLearningPlansParams {
  cursor?: string;
  limit?: number;
  search?: string;
  status?: LearningPlanStatus;
  sortBy?: "createdAt" | "updatedAt" | "title";
  sortOrder?: "asc" | "desc";
}

// 응답 타입
export interface LearningPlanListResult {
  plans: LearningPlan[];
  pagination: {
    nextCursor?: string;
    hasMore: boolean;
  };
}
```

**특징**:
- ✅ 비즈니스 도메인 용어 사용
- ✅ 의미 있는 계층 구조 (settings, timestamps, pagination)
- ✅ API 응답 구조와 독립적
- ✅ JSDoc으로 의도 명시

### 4.3 매퍼 함수

**services/learning-plan/mappers.ts**
```typescript
import type { paths } from "@/api/schema";
import type {
  LearningPlan,
  LearningPlanListResult,
  CreateLearningPlanInput,
  UpdateLearningPlanInput,
} from "./types";

// API 타입 추출
type ApiLearningPlan = paths["/plans"]["get"]["responses"][200]["content"]["application/json"]["data"][number];
type ApiListResponse = paths["/plans"]["get"]["responses"][200]["content"]["application/json"];

/**
 * API 응답을 도메인 모델로 변환
 */
export function toLearningPlan(apiData: ApiLearningPlan): LearningPlan {
  return {
    id: apiData.id,
    title: apiData.title,
    emoji: apiData.emoji,
    description: apiData.description,
    status: apiData.status,
    settings: {
      topic: apiData.learningTopic,
      level: apiData.userLevel,
      duration: {
        weeks: apiData.targetWeeks,
        hoursPerWeek: apiData.weeklyHours,
      },
      preferences: {
        style: apiData.learningStyle as any,
        resources: apiData.preferredResources as any,
      },
      goal: apiData.mainGoal,
      additionalNotes: apiData.additionalRequirements ?? undefined,
    },
    timestamps: {
      createdAt: new Date(apiData.createdAt),
      updatedAt: new Date(apiData.updatedAt),
    },
  };
}

export function toLearningPlanList(apiResponse: ApiListResponse): LearningPlanListResult {
  return {
    plans: apiResponse.data.map(toLearningPlan),
    pagination: {
      nextCursor: apiResponse.nextCursor ?? undefined,
      hasMore: !!apiResponse.nextCursor,
    },
  };
}

/**
 * 도메인 입력을 API 요청으로 변환
 */
export function toApiCreateRequest(input: CreateLearningPlanInput) {
  return {
    title: input.title,
    emoji: input.emoji,
    description: input.description,
    learningTopic: input.settings.topic,
    userLevel: input.settings.level,
    targetWeeks: input.settings.duration.weeks,
    weeklyHours: input.settings.duration.hoursPerWeek,
    learningStyle: input.settings.preferences.style,
    preferredResources: input.settings.preferences.resources,
    mainGoal: input.settings.goal,
    additionalRequirements: input.settings.additionalNotes ?? null,
  };
}

export function toApiUpdateRequest(input: UpdateLearningPlanInput) {
  const base: Record<string, unknown> = {};

  if (input.title !== undefined) base.title = input.title;
  if (input.emoji !== undefined) base.emoji = input.emoji;
  if (input.description !== undefined) base.description = input.description;

  if (input.settings) {
    const s = input.settings;
    if (s.topic !== undefined) base.learningTopic = s.topic;
    if (s.level !== undefined) base.userLevel = s.level;
    if (s.duration?.weeks !== undefined) base.targetWeeks = s.duration.weeks;
    if (s.duration?.hoursPerWeek !== undefined) base.weeklyHours = s.duration.hoursPerWeek;
    if (s.preferences?.style !== undefined) base.learningStyle = s.preferences.style;
    if (s.preferences?.resources !== undefined) base.preferredResources = s.preferences.resources;
    if (s.goal !== undefined) base.mainGoal = s.goal;
    if (s.additionalNotes !== undefined) base.additionalRequirements = s.additionalNotes ?? null;
  }

  return base;
}
```

**특징**:
- ✅ 단방향 변환만 수행 (로직 없음)
- ✅ 타입 안전성 보장
- ✅ API 구조 변경 시 이 파일만 수정

### 4.4 API 호출 함수

**services/learning-plan/api.ts**
```typescript
import { apiClient, handleApiError, ApiError } from "@/api/client";
import type {
  LearningPlan,
  LearningPlanListResult,
  CreateLearningPlanInput,
  UpdateLearningPlanInput,
  ListLearningPlansParams,
} from "./types";
import {
  toLearningPlan,
  toLearningPlanList,
  toApiCreateRequest,
  toApiUpdateRequest,
} from "./mappers";

/**
 * 학습 계획 목록 조회
 */
export async function listLearningPlans(
  params?: ListLearningPlansParams,
): Promise<LearningPlanListResult> {
  const response = await apiClient.GET("/plans", {
    params: {
      query: params ? {
        cursor: params.cursor,
        limit: params.limit,
        search: params.search,
        status: params.status,
        sort: params.sortBy,
        order: params.sortOrder,
      } : undefined,
    },
  });

  if (response.error) {
    throw handleApiError(response.error);
  }

  return toLearningPlanList(response.data);
}

/**
 * 학습 계획 상세 조회
 */
export async function getLearningPlan(id: string): Promise<LearningPlan> {
  const response = await apiClient.GET("/plans/{id}", {
    params: { path: { id } },
  });

  if (response.error) {
    throw handleApiError(response.error);
  }

  return toLearningPlan(response.data);
}

/**
 * 학습 계획 생성
 */
export async function createLearningPlan(
  input: CreateLearningPlanInput,
): Promise<LearningPlan> {
  const response = await apiClient.POST("/plans", {
    body: toApiCreateRequest(input),
  });

  if (response.error) {
    throw handleApiError(response.error);
  }

  return toLearningPlan(response.data);
}

/**
 * 학습 계획 수정
 */
export async function updateLearningPlan(
  id: string,
  input: UpdateLearningPlanInput,
): Promise<LearningPlan> {
  const response = await apiClient.PATCH("/plans/{id}", {
    params: { path: { id } },
    body: toApiUpdateRequest(input),
  });

  if (response.error) {
    throw handleApiError(response.error);
  }

  return toLearningPlan(response.data);
}

/**
 * 학습 계획 삭제
 */
export async function deleteLearningPlan(id: string): Promise<void> {
  const response = await apiClient.DELETE("/plans/{id}", {
    params: { path: { id } },
  });

  if (response.error) {
    throw handleApiError(response.error);
  }
}

/**
 * 학습 계획 상태 변경
 */
export async function updateLearningPlanStatus(
  id: string,
  status: "active" | "archived",
): Promise<LearningPlan> {
  const response = await apiClient.PATCH("/plans/{id}/status", {
    params: { path: { id } },
    body: { status },
  });

  if (response.error) {
    throw handleApiError(response.error);
  }

  return toLearningPlan(response.data);
}
```

**특징**:
- ✅ openapi-fetch 직접 사용
- ✅ 에러 처리 일관성
- ✅ 매퍼로 도메인 모델 변환

### 4.5 Public API

**services/learning-plan/index.ts**
```typescript
// 타입만 export (도메인 모델)
export type {
  LearningPlan,
  LearningPlanStatus,
  LearningPlanSettings,
  LearningPlanListResult,
  CreateLearningPlanInput,
  UpdateLearningPlanInput,
  ListLearningPlansParams,
  UserLevel,
  Duration,
  Preferences,
  LearningStyle,
  ResourceType,
} from "./types";

// API 함수 export
export {
  listLearningPlans,
  getLearningPlan,
  createLearningPlan,
  updateLearningPlan,
  deleteLearningPlan,
  updateLearningPlanStatus,
} from "./api";

// 매퍼는 export 하지 않음 (내부 구현)
```

**특징**:
- ✅ 도메인 모델과 API 함수만 외부 노출
- ✅ 매퍼는 내부 구현으로 숨김
- ✅ Clean API

### 4.6 Feature에서 사용

**Before (현재)**
```typescript
// features/learning-plan/hooks/use-learning-plans.ts
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/http-client";

export function useLearningPlans(params?) {
  return useQuery({
    queryKey: ["learning-plans", params],
    queryFn: async () => {
      const response = await api.learningPlans.list(params);
      if (response.error) {
        throw new Error("Failed");
      }
      // API 응답 구조 그대로 사용
      return response.data;
    },
  });
}
```

**After (개선)**
```typescript
// features/learning-plan/hooks/use-learning-plans.ts
import { useQuery } from "@tanstack/react-query";
import {
  listLearningPlans,
  type ListLearningPlansParams,
  type LearningPlanListResult,
} from "@/api/services/learning-plan";

export function useLearningPlans(params?: ListLearningPlansParams) {
  return useQuery<LearningPlanListResult>({
    queryKey: ["learning-plans", params],
    queryFn: () => listLearningPlans(params),
    // 에러는 자동으로 throw됨
  });
}

export function useLearningPlan(id: string) {
  return useQuery({
    queryKey: ["learning-plans", id],
    queryFn: () => getLearningPlan(id),
    enabled: !!id,
  });
}
```

**특징**:
- ✅ 더 간결한 코드
- ✅ 도메인 모델 타입 사용
- ✅ API 구조와 독립적

**컴포넌트에서 사용**
```typescript
// features/learning-plan/components/LearningPlanCard.tsx
import type { LearningPlan } from "@/api/services/learning-plan";

interface Props {
  plan: LearningPlan;
}

export function LearningPlanCard({ plan }: Props) {
  return (
    <div>
      <h3>{plan.emoji} {plan.title}</h3>
      <p>{plan.description}</p>
      <div>
        <span>주제: {plan.settings.topic}</span>
        <span>레벨: {plan.settings.level}</span>
        <span>기간: {plan.settings.duration.weeks}주</span>
      </div>
    </div>
  );
}
```

**특징**:
- ✅ 의미 있는 계층 구조 (`plan.settings.duration.weeks`)
- ✅ API 응답 구조와 무관
- ✅ 비즈니스 도메인 표현

### 4.7 에러 처리

**client.ts (기존 파일에 추가)**
```typescript
import createClient from "openapi-fetch";
import type { paths } from "./schema";

export const apiClient = createClient<paths>({
  baseUrl: import.meta.env.VITE_API_URL,
  credentials: "include",
});

/**
 * 표준 API 에러
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * 에러 처리 유틸
 */
export function handleApiError(error: unknown): ApiError {
  // openapi-fetch 에러
  if (typeof error === "object" && error !== null) {
    if ("status" in error) {
      const status = (error as { status: number }).status;
      return new ApiError(
        getErrorMessage(status),
        status,
        `HTTP_${status}`,
        error,
      );
    }
  }

  // 네트워크 에러
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return new ApiError(
      "네트워크 연결을 확인해주세요",
      undefined,
      "NETWORK_ERROR",
    );
  }

  // 기타 에러
  return new ApiError(
    "알 수 없는 오류가 발생했습니다",
    undefined,
    "UNKNOWN_ERROR",
    error,
  );
}

function getErrorMessage(status: number): string {
  const messages: Record<number, string> = {
    400: "잘못된 요청입니다",
    401: "로그인이 필요합니다",
    403: "권한이 없습니다",
    404: "요청한 리소스를 찾을 수 없습니다",
    409: "이미 존재하는 데이터입니다",
    422: "입력값을 확인해주세요",
    429: "너무 많은 요청이 발생했습니다",
    500: "서버 오류가 발생했습니다",
    503: "서비스를 일시적으로 사용할 수 없습니다",
  };

  return messages[status] || `오류가 발생했습니다 (${status})`;
}
```

**Feature에서 에러 처리**
```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createLearningPlan, type CreateLearningPlanInput } from "@/api/services/learning-plan";
import { ApiError } from "@/api/client";

export function useCreateLearningPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createLearningPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learning-plans"] });
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          // 로그인 페이지로 리다이렉트
          window.location.href = "/login";
        } else if (error.status === 422) {
          // 입력값 검증 에러 표시
          toast.error(error.message);
        } else {
          // 일반 에러
          toast.error(error.message);
        }
      }
    },
  });
}
```

---

## 5. 마이그레이션 전략

### 5.1 단계별 마이그레이션 (3주)

#### Week 1: 기반 구축 및 첫 모듈

**작업 내용**:
1. 디렉토리 구조 생성
   ```bash
   mkdir -p apps/web/src/api/services/learning-plan
   ```

2. `client.ts` 개선
   - `ApiError` 클래스 추가
   - `handleApiError` 함수 추가

3. `learning-plan` 모듈 구현
   - `types.ts`: 도메인 모델 정의
   - `mappers.ts`: 변환 함수
   - `api.ts`: API 호출 함수
   - `index.ts`: Public API

4. 관련 Hook 마이그레이션
   - `useLearningPlans`
   - `useLearningPlan`
   - `useCreateLearningPlan`

**검증**:
- [ ] 기존 기능 정상 동작
- [ ] 도메인 모델로 변환 확인
- [ ] 타입 체크 통과

#### Week 2: 나머지 모듈 마이그레이션

**작업 내용**:
1. 우선순위별 모듈 마이그레이션
   - `auth`
   - `ai`
   - `progress`
   - `documents`

2. 각 모듈별 동일 패턴 적용
   - types.ts → mappers.ts → api.ts → index.ts

3. Feature Hook 업데이트

**검증**:
- [ ] 모든 모듈 마이그레이션 완료
- [ ] 기존 기능 정상 동작
- [ ] 타입 안전성 확인

#### Week 3: 정리 및 문서화

**작업 내용**:
1. 레거시 코드 제거
   - 기존 `http-client.ts`의 개별 함수 제거
   - 사용하지 않는 코드 정리

2. 문서 업데이트
   - `apps/web/CLAUDE.md` 업데이트
   - API 사용 가이드 작성
   - 도메인 모델 문서

3. 코드 리뷰 및 최적화

**검증**:
- [ ] 레거시 코드 제거 완료
- [ ] 문서 업데이트 완료
- [ ] 팀 리뷰 완료

### 5.2 병렬 운영 전략

```typescript
// api/index.ts - 마이그레이션 중 과도기

// 새로운 서비스 (마이그레이션 완료)
export * as learningPlan from "./services/learning-plan";
export * as auth from "./services/auth";

// 레거시 API (아직 마이그레이션 전)
export { api as legacyApi } from "./http-client";
```

**Feature에서 사용**:
```typescript
// 새 방식 (마이그레이션 완료)
import { listLearningPlans } from "@/api/services/learning-plan";

// 레거시 방식 (아직 마이그레이션 전)
import { legacyApi } from "@/api";
const response = await legacyApi.progress.daily();
```

### 5.3 마이그레이션 체크리스트

#### 모듈별 체크리스트

각 도메인 모듈 마이그레이션 시:

- [ ] `types.ts` - 도메인 모델 정의
- [ ] `mappers.ts` - 변환 함수 구현
- [ ] `api.ts` - API 호출 함수
- [ ] `index.ts` - Public API
- [ ] Feature Hook 업데이트
- [ ] 컴포넌트 타입 업데이트
- [ ] 기능 테스트 확인
- [ ] 타입 체크 통과

#### 전체 완료 체크

- [ ] 모든 도메인 모듈 마이그레이션
- [ ] 레거시 코드 제거
- [ ] 문서 업데이트
- [ ] 팀 리뷰 완료
- [ ] 성능 회귀 없음

---

## 6. 기대 효과

### 6.1 결합도 감소

#### Before: API 구조에 직접 의존

```typescript
// API 응답 구조 변경 시 Feature 영향
const plan = response.data;
console.log(plan.learningTopic);      // 백엔드 필드명
console.log(plan.targetWeeks);        // Flat 구조
console.log(plan.learningStyle);
```

#### After: 도메인 모델 사용

```typescript
// API 응답 구조 변경 시 매퍼만 수정
const plan = response;
console.log(plan.settings.topic);              // 도메인 용어
console.log(plan.settings.duration.weeks);     // 의미 있는 계층
console.log(plan.settings.preferences.style);
```

**개선 효과**:
- ✅ 백엔드 필드명 변경 → 매퍼만 수정
- ✅ API 구조 변경 → Feature 코드 변경 불필요
- ✅ 비즈니스 로직과 API 계층 분리

### 6.2 유지보수성 향상

#### 코드 조직화

**Before**: 단일 파일 440줄
```
api/http-client.ts (440줄)
  - 모든 API 함수
  - 도메인 구분 없음
```

**After**: 도메인별 모듈화
```
api/services/
  learning-plan/ (4파일, 각 50-100줄)
  auth/ (4파일)
  ai/ (4파일)
  ...
```

**개선 효과**:
- ✅ 파일 크기 감소 (440줄 → 50-100줄)
- ✅ 도메인별 응집도 증가
- ✅ 찾기 쉬운 구조

#### 에러 처리 일관성

**Before**: 중복된 에러 처리
```typescript
// Feature A
if (response.error) {
  if (response.error.status === 401) {
    // ...
  }
}

// Feature B - 동일 로직 반복
if (response.error) {
  if (response.error.status === 401) {
    // ...
  }
}
```

**After**: 중앙화된 에러 처리
```typescript
// api/client.ts에서 일괄 처리
export function handleApiError(error: unknown): ApiError {
  // 모든 API에서 일관된 에러 처리
}

// Feature에서는 ApiError만 처리
try {
  await createLearningPlan(input);
} catch (error) {
  if (error instanceof ApiError) {
    // 표준화된 에러 객체
  }
}
```

**개선 효과**:
- ✅ 에러 처리 중복 제거
- ✅ 일관된 에러 메시지
- ✅ 유지보수 용이

### 6.3 비즈니스 로직 표현력

#### 의미 있는 도메인 모델

**Before**: API 구조 그대로
```typescript
interface Plan {
  learningTopic: string;          // 백엔드 필드명
  targetWeeks: number;            // Flat 구조
  weeklyHours: number;
  learningStyle: string;
  preferredResources: string;
  mainGoal: string;
  additionalRequirements: string | null;
}
```

**After**: 비즈니스 개념 표현
```typescript
interface LearningPlan {
  settings: LearningPlanSettings;  // 의미 있는 그룹핑
}

interface LearningPlanSettings {
  topic: string;                   // 도메인 용어
  level: UserLevel;
  duration: Duration;              // 관련 정보 묶음
  preferences: Preferences;        // 관련 정보 묶음
  goal: string;
}

interface Duration {
  weeks: number;
  hoursPerWeek: number;
}
```

**개선 효과**:
- ✅ 비즈니스 의도 명확
- ✅ 관련 정보 그룹핑
- ✅ 도메인 용어 사용

### 6.4 코드 품질 지표

| 지표 | Before | After | 개선 |
|------|--------|-------|------|
| **최대 파일 크기** | 440줄 | 100줄 | -77% |
| **에러 처리 중복** | 높음 | 없음 | -100% |
| **API 의존도** | 직접 의존 | 간접 의존 | ✓ |
| **도메인 표현력** | 낮음 | 높음 | ✓ |
| **변경 영향 범위** | Feature | Mapper | ✓ |

---

## 결론

### 핵심 개선 사항

이 아키텍처 개선안은 **실용적이고 점진적인 접근**을 목표로 합니다.

#### ✅ 해결하는 문제

1. **API 타입 직접 의존** → 도메인 모델로 추상화
2. **에러 처리 중복** → 중앙화된 에러 처리
3. **단일 파일 비대화** → 도메인별 모듈화
4. **비즈니스 로직 표현 제약** → 의미 있는 도메인 모델

#### ✅ 하지 않는 것

1. ❌ 새로운 패키지 추가
2. ❌ HTTP 클라이언트 추상화 (openapi-fetch 그대로)
3. ❌ Mock 데이터/서비스
4. ❌ 복잡한 DI 컨테이너
5. ❌ 과도한 레이어

#### ✅ 주요 변경

1. **도메인 모델 정의** (`services/*/types.ts`)
   - API와 독립적인 비즈니스 엔티티
   - 의미 있는 계층 구조

2. **매퍼 레이어** (`services/*/mappers.ts`)
   - API ↔ 도메인 변환
   - 변경 영향 범위 최소화

3. **도메인별 모듈화** (`services/*/`)
   - 관심사별 분리
   - 높은 응집도

4. **에러 처리 표준화** (`client.ts`)
   - 일관된 에러 처리
   - 중복 제거

### 다음 단계

1. **Week 1**: learning-plan 모듈 구현 (PoC)
2. **Week 2**: 나머지 모듈 마이그레이션
3. **Week 3**: 레거시 제거 및 문서화

### 투자 대비 효과

- **투자**: 3주 (1인 풀타임)
- **효과**:
  - API 변경 영향 범위 최소화
  - 코드 가독성 및 유지보수성 향상
  - 비즈니스 로직 표현력 증가
  - 에러 처리 일관성 확보

**ROI**: 첫 API 구조 변경 시 투자 가치 입증 예상
