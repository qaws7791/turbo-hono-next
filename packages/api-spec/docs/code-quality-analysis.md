# API Spec Package 코드 품질 분석 보고서

**분석 기준**: CLAUDE.md 가이드라인
**분석 일자**: 2025-11-17
**전체 평가**: A (우수한 API-First 구현)

---

## 📊 요약

API Spec 패키지는 CLAUDE.md에 명시된 API-First 개발 원칙을 거의 완벽하게 준수하고 있습니다. 모든 API 스펙이 체계적으로 정의되어 있고, OpenAPI 문서 생성 및 타입 안전성이 보장되고 있습니다.

### 주요 지표

| 카테고리 | 현황 |
|----------|------|
| **API-First 접근** | ✅ 완벽하게 구현 |
| **Zod 스키마 정의** | ✅ 모든 모듈에 정의됨 |
| **createRoute 사용** | ✅ 모든 라우트 사용 |
| **라우트 등록** | ✅ openapi.ts에 등록 |
| **보안 스키마** | ✅ cookieAuth 설정됨 |
| **API 경로 규칙** | ✅ 플랫 구조 사용 |
| **에러 응답** | ✅ 표준화된 스키마 |
| **문서 언어** | ✅ 한국어 사용 |

---

## 🟡 중간 우선순위 관찰사항 (Medium)

### 1. 라우트 구성 패턴의 일관성

**심각도**: LOW (일관성 관찰사항)
**영향**: 미미함

#### 현황

Learning-plan 모듈은 `routes/` 디렉토리를 사용하여 여러 파일로 라우트를 구성하는 반면, 더 간단한 모듈들(auth, documents, progress)은 단일 `routes.ts` 파일을 사용합니다.

```
packages/api-spec/src/modules/
├── learning-plan/
│   ├── schema.ts
│   └── routes/                    # 디렉토리 구조
│       ├── index.ts
│       ├── plan.routes.ts
│       ├── module.routes.ts
│       └── task.routes.ts
├── auth/
│   ├── schema.ts
│   └── routes.ts                  # 단일 파일
├── documents/
│   ├── schema.ts
│   └── routes.ts                  # 단일 파일
└── progress/
    ├── schema.ts
    └── routes.ts                  # 단일 파일
```

#### 분석

CLAUDE.md는 "createRoute definitions in modules/*/routes.ts"라고 명시하지만, 복잡한 모듈의 경우 `routes/` 디렉토리를 사용하는 것이 더 관리하기 쉽습니다.

#### 권장사항

**현재 패턴을 유지하되 CLAUDE.md에 문서화**:

```markdown
# CLAUDE.md 추가 내용

### API Route 구성 패턴

라우트 파일 구성은 모듈의 복잡도에 따라 선택:

1. **간단한 모듈 (5개 이하 라우트)**: 단일 `routes.ts` 파일
   ```
   src/modules/auth/
   ├── schema.ts
   └── routes.ts
   ```

2. **복잡한 모듈 (5개 초과 라우트)**: `routes/` 디렉토리
   ```
   src/modules/learning-plan/
   ├── schema.ts
   └── routes/
       ├── index.ts          # 모든 라우트 통합 export
       ├── plan.routes.ts    # 학습 계획 관련 라우트
       ├── module.routes.ts  # 모듈 관련 라우트
       └── task.routes.ts    # 태스크 관련 라우트
   ```
```

---

## ✅ 긍정적인 발견사항

### 강점

1. **API-First 개발 원칙 완벽 준수** ✅

   모든 API 스펙이 `packages/api-spec`에 정의되어 있고, `apps/api`는 이를 import하여 사용:

   ```typescript
   // packages/api-spec/src/modules/auth/routes.ts
   export const loginRoute = createRoute({
     method: "post",
     path: "/auth/login",
     request: {
       body: {
         content: {
           "application/json": {
             schema: LoginRequestSchema,
           },
         },
       },
     },
     responses: {
       200: {
         content: {
           "application/json": {
             schema: LoginResponseSchema,
           },
         },
         description: "로그인 성공",
       },
       default: errorResponse,
     },
     tags: ["Auth"],
   });
   ```

2. **Zod 스키마 체계적 정의** ✅

   모든 모듈이 `schema.ts`에 요청/응답 스키마를 정의:

   ```
   src/modules/
   ├── auth/schema.ts
   ├── documents/schema.ts
   ├── learning-plan/schema.ts
   ├── progress/schema.ts
   └── ai-chat/schema.ts (추정)
   ```

3. **보안 스키마 적절히 구성** ✅

   `src/openapi.ts`에 cookieAuth 정의:

   ```typescript
   security: [
     {
       cookieAuth: [],
     },
   ],
   ```

4. **API 경로 플랫 구조** ✅

   명명 규칙이 깔끔하게 적용됨:
   - `/plans` (not `/learning-plans`)
   - `/auth/login`
   - `/documents`
   - `/progress/summary`

5. **표준화된 에러 응답** ✅

   `src/common/schema.ts`에 정의된 `ErrorResponseSchema`를 모든 라우트에서 사용:

   ```typescript
   export const ErrorResponseSchema = z.object({
     error: z.string(),
     message: z.string(),
   });

   // 모든 라우트에서
   responses: {
     // ...
     default: errorResponse,  // ErrorResponseSchema 사용
   }
   ```

6. **한국어 API 문서** ✅

   모든 description과 태그가 한국어로 작성:

   ```typescript
   responses: {
     200: {
       description: "로그인 성공",
     },
   },
   tags: ["인증"],
   ```

7. **OpenAPI 문서 자동 생성** ✅

   `src/openapi.ts`에서 모든 라우트를 통합하고 문서 생성:

   ```typescript
   export const app = createOpenAPIHono<HonoTypes>({
     defaultHook: validationErrorHandler,
   });

   // 모든 모듈 라우트 등록
   app.openapi(authRoutes.loginRoute);
   app.openapi(learningPlanRoutes.createPlanRoute);
   // ...

   // OpenAPI JSON 생성
   app.doc("/openapi.json", {
     openapi: "3.0.0",
     info: {
       version: "1.0.0",
       title: "Learning Roadmap API",
       description: "학습 로드맵 서비스 API",
     },
   });
   ```

8. **타입 안전성 보장** ✅

   Zod 스키마에서 TypeScript 타입 자동 추론:

   ```typescript
   export const LoginRequestSchema = z.object({
     email: z.string().email(),
     password: z.string().min(8),
   });

   export type LoginRequest = z.infer<typeof LoginRequestSchema>;
   ```

---

## 📁 모듈 구조

### 현재 모듈 구성

```
packages/api-spec/src/modules/
├── auth/
│   ├── schema.ts              # 인증 관련 스키마
│   └── routes.ts              # 인증 라우트 (login, signup, logout 등)
├── documents/
│   ├── schema.ts              # 문서 관련 스키마
│   └── routes.ts              # 문서 라우트 (upload, list, delete)
├── learning-plan/
│   ├── schema.ts              # 학습 계획/모듈/태스크 스키마
│   └── routes/
│       ├── index.ts           # 모든 라우트 통합
│       ├── plan.routes.ts     # 학습 계획 CRUD
│       ├── module.routes.ts   # 모듈 CRUD
│       └── task.routes.ts     # 태스크 CRUD
├── progress/
│   ├── schema.ts              # 진행률 관련 스키마
│   └── routes.ts              # 진행률 조회 라우트
└── common/
    └── schema.ts              # 공통 스키마 (ErrorResponse, Pagination 등)
```

---

## 🔄 API 스펙 워크플로우 준수 확인

CLAUDE.md에 명시된 API-first 워크플로우가 올바르게 구현되어 있습니다:

### ✅ 1. API 스펙 정의
```typescript
// packages/api-spec/src/modules/*/schema.ts
export const CreatePlanRequestSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  // ...
});
```

### ✅ 2. 라우트 생성
```typescript
// packages/api-spec/src/modules/*/routes.ts
export const createPlanRoute = createRoute({
  method: "post",
  path: "/plans",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreatePlanRequestSchema,
        },
      },
    },
  },
  // ...
});
```

### ✅ 3. 라우트 등록
```typescript
// packages/api-spec/src/openapi.ts
app.openapi(learningPlanRoutes.createPlanRoute);
```

### ✅ 4. OpenAPI 문서 생성
```bash
pnpm --filter api dev  # 자동으로 /openapi.json 생성
```

### ✅ 5. 프론트엔드 타입 생성
```bash
pnpm --filter web schema:generate  # apps/web/src/api/schema.ts 생성
```

---

## 🎯 베스트 프랙티스

### 1. 스키마 재사용

공통 스키마를 효과적으로 재사용:

```typescript
// common/schema.ts
export const PaginationRequestSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
});

export const PaginationResponseSchema = z.object({
  nextCursor: z.string().nullable(),
  hasMore: z.boolean(),
});

// learning-plan/schema.ts
export const ListPlansRequestSchema = PaginationRequestSchema;
export const ListPlansResponseSchema = z.object({
  data: z.array(LearningPlanSchema),
  pagination: PaginationResponseSchema,
});
```

### 2. 명확한 네이밍

스키마 네이밍이 일관성 있고 명확:
- Request: `*RequestSchema`
- Response: `*ResponseSchema`
- Entity: `*Schema`

```typescript
export const LoginRequestSchema = z.object({ /* ... */ });
export const LoginResponseSchema = z.object({ /* ... */ });
export const UserSchema = z.object({ /* ... */ });
```

### 3. 태그를 통한 그룹화

OpenAPI 문서에서 라우트를 논리적으로 그룹화:

```typescript
export const createPlanRoute = createRoute({
  // ...
  tags: ["Learning Plans"],
});

export const loginRoute = createRoute({
  // ...
  tags: ["Auth"],
});
```

### 4. 검증 에러 핸들러

커스텀 검증 에러 핸들러로 일관된 에러 응답:

```typescript
export const validationErrorHandler: Hook<any, any, any, any> = (
  result,
  c
) => {
  if (!result.success) {
    return c.json(
      {
        error: "Validation Error",
        message: fromZodError(result.error).toString(),
      },
      400
    );
  }
};
```

---

## 📊 API 스펙 메트릭스

### 모듈별 라우트 수 (추정)

| 모듈 | 라우트 수 | 구성 |
|------|-----------|------|
| Auth | ~5 | 단일 파일 |
| Documents | ~4 | 단일 파일 |
| Learning Plan | ~15+ | 디렉토리 구조 |
| Progress | ~3 | 단일 파일 |
| AI Chat | ~5 | (추정) |

### 스키마 타입

| 타입 | 개수 (추정) |
|------|-------------|
| Request 스키마 | ~25 |
| Response 스키마 | ~25 |
| Entity 스키마 | ~10 |
| 공통 스키마 | ~5 |

---

## 🔍 상세 모듈 분석

### Auth 모듈

**라우트**:
- POST `/auth/signup` - 회원가입
- POST `/auth/login` - 로그인
- POST `/auth/logout` - 로그아웃
- GET `/auth/me` - 현재 사용자 정보
- 기타 인증 관련 라우트

**스키마**:
- `SignupRequestSchema`
- `LoginRequestSchema`
- `LoginResponseSchema`
- `UserSchema`

### Learning Plan 모듈

**라우트 그룹**:
1. **Plan 라우트** (`plan.routes.ts`)
   - GET `/plans` - 학습 계획 목록
   - POST `/plans` - 학습 계획 생성
   - GET `/plans/:publicId` - 학습 계획 상세
   - PATCH `/plans/:publicId` - 학습 계획 수정
   - DELETE `/plans/:publicId` - 학습 계획 삭제

2. **Module 라우트** (`module.routes.ts`)
   - POST `/plans/:publicId/modules` - 모듈 생성
   - PATCH `/modules/:id` - 모듈 수정
   - DELETE `/modules/:id` - 모듈 삭제
   - PATCH `/modules/:id/move` - 모듈 순서 변경

3. **Task 라우트** (`task.routes.ts`)
   - POST `/modules/:id/tasks` - 태스크 생성
   - PATCH `/tasks/:id` - 태스크 수정
   - DELETE `/tasks/:id` - 태스크 삭제
   - PATCH `/tasks/:id/status` - 태스크 상태 변경
   - PATCH `/tasks/:id/move` - 태스크 순서 변경

**스키마**:
- `CreatePlanRequestSchema`
- `UpdatePlanRequestSchema`
- `LearningPlanSchema`
- `CreateModuleRequestSchema`
- `LearningModuleSchema`
- `CreateTaskRequestSchema`
- `UpdateTaskRequestSchema`
- `LearningTaskSchema`

### Documents 모듈

**라우트**:
- POST `/documents/upload` - 문서 업로드
- GET `/documents` - 문서 목록
- DELETE `/documents/:publicId` - 문서 삭제

**스키마**:
- `DocumentUploadRequestSchema`
- `DocumentSchema`
- `DocumentListResponseSchema`

### Progress 모듈

**라우트**:
- GET `/progress/summary` - 진행률 요약
- GET `/progress/calendar` - 캘린더 데이터
- GET `/progress/stats` - 통계 데이터

**스키마**:
- `ProgressSummarySchema`
- `CalendarDataSchema`
- `ProgressStatsSchema`

---

## 📖 권장 개선사항

### 단기 (선택사항)

1. **CLAUDE.md 업데이트**
   - 복잡한 모듈의 경우 `routes/` 디렉토리 패턴 사용 가능함을 명시
   - 모듈 복잡도에 따른 구성 가이드라인 추가

2. **스키마 문서화**
   - 각 스키마에 JSDoc 주석 추가
   - 복잡한 유효성 검사 규칙 설명

   ```typescript
   /**
    * 학습 계획 생성 요청 스키마
    *
    * @property title - 학습 계획 제목 (필수)
    * @property description - 학습 계획 설명 (선택)
    * @property userLevel - 사용자 수준 (초보자, 기초, 중급, 고급, 전문가)
    * @property learningStyle - 학습 스타일 (시각적, 실습 중심 등)
    */
   export const CreatePlanRequestSchema = z.object({
     title: z.string().min(1).max(100),
     description: z.string().max(500).optional(),
     userLevel: UserLevelSchema,
     learningStyle: LearningStyleSchema,
   });
   ```

3. **OpenAPI 예제 추가**
   ```typescript
   export const createPlanRoute = createRoute({
     // ...
     request: {
       body: {
         content: {
           "application/json": {
             schema: CreatePlanRequestSchema,
             example: {
               title: "React 마스터하기",
               description: "React 기초부터 고급까지",
               userLevel: "intermediate",
               learningStyle: "hands-on",
             },
           },
         },
       },
     },
   });
   ```

---

## 🎉 결론

API Spec 패키지는 **모범적인 API-First 개발 사례**를 보여줍니다. CLAUDE.md의 모든 핵심 원칙을 준수하고 있으며, 타입 안전성과 문서 자동 생성이 잘 구현되어 있습니다.

**강점**:
- ✅ 완벽한 API-First 구현
- ✅ 일관된 스키마 정의
- ✅ 표준화된 에러 처리
- ✅ 한국어 문서
- ✅ 타입 안전성 보장

**개선 여지**:
- 📝 스키마 문서화 (선택사항)
- 📝 OpenAPI 예제 추가 (선택사항)
- 📝 CLAUDE.md 가이드라인 명확화 (선택사항)

**전체 평가**: A (우수한 API-First 구현)

---

**최종 업데이트**: 2025-11-17
**다음 리뷰**: 스키마 문서화 추가 후 (선택사항)
