# neverthrow 도입 구현 계획

## 1. 개요

### 1.1. 배경 및 목적

현재 백엔드에서는 에러 핸들링을 위해 `throw` 기반의 예외 처리 방식을 사용하고 있습니다:

```typescript
// 현재 방식: throw 기반
throw new ApiError(400, "MATERIAL_FILE_TOO_LARGE", "파일 크기가 너무 큽니다.");
```

이 방식의 **문제점**:

- 함수 시그니처에서 에러 타입이 드러나지 않음
- 컴파일 타임에 에러 핸들링 여부를 체크할 수 없음
- 어떤 함수가 어떤 에러를 던지는지 추적하기 어려움
- 예외 흐름이 코드의 가독성을 해침

**neverthrow 도입 목표**:

- 타입 안전한 에러 핸들링 (`Result<T, E>` 타입)
- 명시적인 에러 전파 및 핸들링 강제
- 함수형 체이닝을 통한 깔끔한 에러 흐름 관리
- 컴파일 타임 에러 핸들링 검증

### 1.2. neverthrow 핵심 개념

```typescript
import { ok, err, Result, ResultAsync } from "neverthrow";

// 성공 케이스
const success = ok({ id: "123", name: "test" });

// 실패 케이스
const failure = err({ code: "NOT_FOUND", message: "자료를 찾을 수 없습니다." });

// Result 타입 반환
function findUser(id: string): Result<User, UserNotFoundError> {
  const user = users.get(id);
  if (!user) {
    return err({
      code: "USER_NOT_FOUND",
      message: "사용자를 찾을 수 없습니다.",
    });
  }
  return ok(user);
}

// ResultAsync for async operations
function findUserAsync(id: string): ResultAsync<User, UserNotFoundError> {
  return ResultAsync.fromPromise(
    db.users.findUnique({ where: { id } }),
    (e) => ({ code: "DB_ERROR", message: String(e) }),
  ).andThen((user) =>
    user
      ? ok(user)
      : err({ code: "USER_NOT_FOUND", message: "사용자를 찾을 수 없습니다." }),
  );
}
```

---

## 2. 현재 아키텍처 분석

### 2.1. 현재 에러 핸들링 패턴

#### 2.1.1. 중앙 에러 클래스 (`ApiError`)

```typescript
// apps/api/src/middleware/error-handler.ts
export class ApiError extends Error {
  constructor(
    public readonly status: ContentfulStatusCode,
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
```

#### 2.1.2. 모듈별 에러 정의

```typescript
// apps/api/src/modules/material/material.errors.ts
export const MaterialErrors = {
  NOT_FOUND: {
    status: 404,
    code: "MATERIAL_NOT_FOUND",
    message: "자료를 찾을 수 없습니다.",
  },
  // ...
} as const;

export const throwMaterialError = createErrorThrower(MaterialErrors);
```

#### 2.1.3. UseCase에서의 에러 처리

```typescript
// apps/api/src/modules/material/usecases/create-material.ts
if (validated.file.size > MAX_FILE_BYTES) {
  throw new ApiError(
    400,
    "MATERIAL_FILE_TOO_LARGE",
    "파일 크기가 너무 큽니다.",
  );
}
```

### 2.2. 레이어 구조

```
Route Handler → UseCase → Repository
     ↓              ↓           ↓
  (에러 변환)   (비즈니스 에러)  (DB 에러)
```

---

## 3. 에러 타입 설계

### 3.1. 공통 에러 타입 정의

```typescript
// apps/api/src/lib/errors/types.ts
import { ContentfulStatusCode } from "hono/utils/http-status";

/**
 * 모든 에러의 기본 인터페이스
 */
export interface AppError {
  readonly _tag: string; // Discriminated union tag
  readonly code: string;
  readonly message: string;
  readonly status: ContentfulStatusCode;
  readonly details?: Record<string, unknown>;
}

/**
 * 도메인별 에러 생성을 위한 팩토리 타입
 */
export type ErrorFactory<TTag extends string, TCode extends string> = {
  readonly _tag: TTag;
  readonly code: TCode;
  readonly message: string;
  readonly status: ContentfulStatusCode;
  readonly details?: Record<string, unknown>;
};
```

### 3.2. 모듈별 에러 타입

```typescript
// apps/api/src/modules/material/material.errors.ts
import { AppError } from "../../lib/errors/types";

// 에러 타입 정의 (Discriminated Union)
export type MaterialError =
  | MaterialNotFoundError
  | MaterialDuplicateError
  | MaterialFileTooLargeError
  | MaterialCreateFailedError
  | MaterialEmbedFailedError;

export interface MaterialNotFoundError extends AppError {
  readonly _tag: "MaterialNotFoundError";
  readonly code: "MATERIAL_NOT_FOUND";
}

export interface MaterialDuplicateError extends AppError {
  readonly _tag: "MaterialDuplicateError";
  readonly code: "MATERIAL_DUPLICATE";
  readonly details: { materialId: string };
}

export interface MaterialFileTooLargeError extends AppError {
  readonly _tag: "MaterialFileTooLargeError";
  readonly code: "MATERIAL_FILE_TOO_LARGE";
  readonly details: { maxBytes: number };
}

// 에러 생성 함수 (팩토리)
export const MaterialErrors = {
  notFound: (): MaterialNotFoundError => ({
    _tag: "MaterialNotFoundError",
    code: "MATERIAL_NOT_FOUND",
    message: "자료를 찾을 수 없습니다.",
    status: 404,
  }),

  duplicate: (materialId: string): MaterialDuplicateError => ({
    _tag: "MaterialDuplicateError",
    code: "MATERIAL_DUPLICATE",
    message: "동일한 파일이 이미 존재합니다.",
    status: 409,
    details: { materialId },
  }),

  fileTooLarge: (maxBytes: number): MaterialFileTooLargeError => ({
    _tag: "MaterialFileTooLargeError",
    code: "MATERIAL_FILE_TOO_LARGE",
    message: "파일 크기가 너무 큽니다.",
    status: 400,
    details: { maxBytes },
  }),
} as const;
```

### 3.3. 공통 인프라 에러

```typescript
// apps/api/src/lib/errors/common.ts
import { AppError } from "./types";

export interface ValidationError extends AppError {
  readonly _tag: "ValidationError";
  readonly code: "VALIDATION_ERROR";
  readonly validation: Array<{ field: string; code: string; message: string }>;
}

export interface UnauthorizedError extends AppError {
  readonly _tag: "UnauthorizedError";
  readonly code: "UNAUTHORIZED";
}

export interface ForbiddenError extends AppError {
  readonly _tag: "ForbiddenError";
  readonly code: "FORBIDDEN";
}

export interface InternalError extends AppError {
  readonly _tag: "InternalError";
  readonly code: "INTERNAL_ERROR";
}

export type CommonError =
  | ValidationError
  | UnauthorizedError
  | ForbiddenError
  | InternalError;

export const CommonErrors = {
  unauthorized: (message = "인증이 필요합니다."): UnauthorizedError => ({
    _tag: "UnauthorizedError",
    code: "UNAUTHORIZED",
    message,
    status: 401,
  }),

  forbidden: (message = "접근 권한이 없습니다."): ForbiddenError => ({
    _tag: "ForbiddenError",
    code: "FORBIDDEN",
    message,
    status: 403,
  }),

  internal: (message = "서버에서 오류가 발생했습니다."): InternalError => ({
    _tag: "InternalError",
    code: "INTERNAL_ERROR",
    message,
    status: 500,
  }),
} as const;
```

---

## 4. 레이어별 구현 전략

### 4.1. Repository 레이어

Repository는 DB 작업의 결과를 `ResultAsync`로 반환합니다.

```typescript
// apps/api/src/modules/material/material.repository.ts
import { ResultAsync, ok, err } from "neverthrow";
import { MaterialErrors, MaterialError } from "./material.errors";
import { CommonErrors, CommonError } from "../../lib/errors/common";

type RepositoryError = MaterialError | CommonError;

export const materialRepository = {
  findByIdForUser(
    userId: string,
    materialId: string,
  ): ResultAsync<typeof materials.$inferSelect, MaterialError> {
    return ResultAsync.fromPromise(
      getDb()
        .select()
        .from(materials)
        .where(and(eq(materials.id, materialId), eq(materials.userId, userId)))
        .limit(1),
      (e) => CommonErrors.internal(String(e)),
    ).andThen((rows) =>
      rows[0] ? ok(rows[0]) : err(MaterialErrors.notFound()),
    );
  },

  findDuplicateByChecksum(
    userId: string,
    checksum: string,
  ): ResultAsync<{ id: string } | null, CommonError> {
    return ResultAsync.fromPromise(
      getDb()
        .select({ id: materials.id })
        .from(materials)
        .where(
          and(
            eq(materials.userId, userId),
            eq(materials.checksum, checksum),
            isNull(materials.deletedAt),
          ),
        )
        .limit(1),
      (e) => CommonErrors.internal(String(e)),
    ).map((rows) => rows[0] ?? null);
  },

  insertMaterial(
    data: typeof materials.$inferInsert,
  ): ResultAsync<{ id: string; title: string }, CommonError> {
    return ResultAsync.fromPromise(
      getDb()
        .insert(materials)
        .values(data)
        .returning({ id: materials.id, title: materials.title }),
      (e) => CommonErrors.internal(String(e)),
    ).andThen((rows) =>
      rows[0]
        ? ok(rows[0])
        : err(CommonErrors.internal("Failed to insert material")),
    );
  },
};
```

### 4.2. UseCase 레이어

UseCase는 비즈니스 로직을 처리하고 `ResultAsync`를 체이닝합니다.

```typescript
// apps/api/src/modules/material/usecases/create-material.ts
import { ResultAsync, ok, err } from "neverthrow";
import { CreateMaterialInput, CreateMaterialResult } from "../material.dto";
import { MaterialErrors, MaterialError } from "../material.errors";
import { CommonError, CommonErrors } from "../../../lib/errors/common";
import { materialRepository } from "../material.repository";

type CreateMaterialError = MaterialError | CommonError;

/**
 * 입력 검증
 */
function validateInput(
  input: unknown,
): ResultAsync<ReturnType<typeof CreateMaterialInput.parse>, CommonError> {
  return ResultAsync.fromThrowable(
    () => CreateMaterialInput.parse(input),
    (e) => ({
      _tag: "ValidationError" as const,
      code: "VALIDATION_ERROR" as const,
      message: "입력값이 올바르지 않습니다.",
      status: 422 as const,
      validation: (e as ZodError).issues.map((issue) => ({
        field: issue.path.join("."),
        code: issue.code.toUpperCase(),
        message: issue.message,
      })),
    }),
  )();
}

/**
 * 중복 체크
 */
function checkDuplicate(
  userId: string,
  checksum: string | null,
): ResultAsync<void, MaterialError | CommonError> {
  if (!checksum) {
    return ResultAsync.fromSafePromise(Promise.resolve()).map(() => undefined);
  }

  return materialRepository
    .findDuplicateByChecksum(userId, checksum)
    .andThen((duplicate) =>
      duplicate ? err(MaterialErrors.duplicate(duplicate.id)) : ok(undefined),
    );
}

/**
 * Material 생성 메인 함수
 */
export function createMaterial(
  userId: string,
  input: unknown,
): ResultAsync<CreateMaterialResultType, CreateMaterialError> {
  return validateInput(input)
    .andThen((validated) =>
      parseSource(validated).map((parsed) => ({ validated, ...parsed })),
    )
    .andThen(({ validated, parsed, fileInfo }) => {
      const checksum = fileInfo?.file.checksumSha256Hex ?? null;
      return checkDuplicate(userId, checksum).map(() => ({
        validated,
        parsed,
        fileInfo,
        checksum,
      }));
    })
    .andThen(({ validated, parsed, fileInfo, checksum }) => {
      const title = inferTitle(validated, parsed, fileInfo);
      const now = new Date();

      return materialRepository
        .insert(materials)
        .values({
          id: crypto.randomUUID(),
          userId,
          sourceType: validated.kind,
          title,
          // ... 나머지 필드들
          processingStatus: "PROCESSING",
          createdAt: now,
          updatedAt: now,
        })
        .map((material) => ({
          material,
          parsed,
          title,
          summary: parsed.fullText.slice(0, 240).trim() || null,
        }));
    })
    .andThen(({ material, parsed, title, summary }) =>
      // 청크 생성 및 임베딩 처리...
      ok(
        CreateMaterialResult.parse({
          mode: "sync",
          materialId: material.id,
          title,
          processingStatus: "READY",
          summary,
        }),
      ),
    );
}
```

### 4.3. Route Handler 레이어

Route Handler에서 `Result`를 HTTP 응답으로 변환합니다.

```typescript
// apps/api/src/lib/result-handler.ts
import { Context } from "hono";
import { Result, ResultAsync } from "neverthrow";
import { AppError } from "./errors/types";

/**
 * Result를 Hono 응답으로 변환
 */
export function handleResult<T>(c: Context, result: Result<T, AppError>) {
  return result.match(
    (data) => c.json(data, 200),
    (error) =>
      c.json(
        {
          error: {
            code: error.code,
            message: error.message,
            details: error.details,
          },
        },
        error.status,
      ),
  );
}

/**
 * ResultAsync를 Hono 응답으로 변환
 */
export async function handleResultAsync<T>(
  c: Context,
  result: ResultAsync<T, AppError>,
) {
  const resolved = await result;
  return handleResult(c, resolved);
}
```

```typescript
// apps/api/src/routes/material.ts
import { handleResultAsync } from "../lib/result-handler";
import { createMaterial } from "../modules/material/usecases/create-material";

app.post("/api/materials", authMiddleware, async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json();

  return handleResultAsync(c, createMaterial(userId, body));
});
```

---

## 5. 마이그레이션 전략

### 5.1. 점진적 마이그레이션 접근법

기존 코드를 한 번에 변경하지 않고, **모듈 단위로 점진적으로** 마이그레이션합니다.

```
Phase 1: 인프라 설정 (1-2일)
   └─ neverthrow 설치 및 공통 타입/유틸 정의

Phase 2: 파일럿 모듈 (2-3일)
   └─ Session 모듈 전체 마이그레이션

Phase 3: 핵심 모듈 (1-2주)
   └─ Material, Plan 모듈 마이그레이션

Phase 4: 나머지 모듈 (1주)
   └─ Space, Chat, Auth 모듈 마이그레이션

Phase 5: 레거시 정리 (2-3일)
   └─ throw 기반 코드 제거 및 문서 업데이트
```

### 5.2. 호환성 레이어

마이그레이션 중 기존 throw 기반 코드와 공존하기 위한 어댑터:

```typescript
// apps/api/src/lib/errors/compat.ts
import { ResultAsync, err } from "neverthrow";
import { ApiError } from "../../middleware/error-handler";
import { AppError, CommonErrors } from "./types";

/**
 * throw 기반 함수를 ResultAsync로 래핑
 */
export function wrapThrowable<T, TArgs extends unknown[]>(
  fn: (...args: TArgs) => Promise<T>,
): (...args: TArgs) => ResultAsync<T, AppError> {
  return (...args) =>
    ResultAsync.fromPromise(fn(...args), (e) => {
      if (e instanceof ApiError) {
        return {
          _tag: "LegacyApiError" as const,
          code: e.code,
          message: e.message,
          status: e.status,
          details: e.details,
        };
      }
      return CommonErrors.internal(String(e));
    });
}

/**
 * Result를 throw로 변환 (레거시 코드 호출 시)
 */
export function unwrapOrThrow<T>(result: Result<T, AppError>): T {
  if (result.isErr()) {
    const error = result.error;
    throw new ApiError(error.status, error.code, error.message, error.details);
  }
  return result.value;
}
```

### 5.3. 단계별 체크리스트

#### Phase 1: 인프라 설정

- [ ] `neverthrow` 패키지 설치
- [ ] `apps/api/src/lib/errors/types.ts` 생성
- [ ] `apps/api/src/lib/errors/common.ts` 생성
- [ ] `apps/api/src/lib/errors/compat.ts` 생성
- [ ] `apps/api/src/lib/result-handler.ts` 생성

#### Phase 2: Session 모듈 파일럿

- [ ] `session.errors.ts` 리팩토링
- [ ] `session.repository.ts` ResultAsync 반환으로 변경
- [ ] `usecases/*.ts` Result 체이닝으로 변경
- [ ] Route Handler 업데이트
- [ ] 테스트 및 검증

#### Phase 3: Material 모듈

- [ ] `material.errors.ts` 리팩토링
- [ ] `material.repository.ts` ResultAsync 반환으로 변경
- [ ] 11개 UseCase 파일 마이그레이션:
  - [ ] `create-material.ts`
  - [ ] `create-material-from-text.ts`
  - [ ] `create-material-from-url.ts`
  - [ ] `complete-material-upload.ts`
  - [ ] `initiate-material-upload.ts`
  - [ ] `delete-material.ts`
  - [ ] `embed-material.ts`
  - [ ] `get-job-status.ts`
  - [ ] `get-material-detail.ts`
  - [ ] `list-materials.ts`
  - [ ] `update-material-title.ts`
- [ ] Route Handler 업데이트

#### Phase 4: Plan 모듈

- [ ] `plan.errors.ts` 리팩토링
- [ ] `plan.repository.ts` ResultAsync 반환으로 변경
- [ ] 6개 UseCase 파일 마이그레이션
- [ ] Route Handler 업데이트

#### Phase 5: 나머지 모듈

- [ ] Space 모듈
- [ ] Chat 모듈
- [ ] Auth 모듈

---

## 6. 코드 변환 가이드

### 6.1. throw → Result 변환 패턴

#### Before (throw 기반)

```typescript
async function getMaterial(userId: string, materialId: string) {
  const material = await materialRepository.findByIdForUser(userId, materialId);

  if (!material) {
    throw new ApiError(404, "MATERIAL_NOT_FOUND", "자료를 찾을 수 없습니다.");
  }

  if (material.deletedAt) {
    throw new ApiError(404, "MATERIAL_NOT_FOUND", "삭제된 자료입니다.");
  }

  return material;
}
```

#### After (Result 기반)

```typescript
function getMaterial(
  userId: string,
  materialId: string,
): ResultAsync<Material, MaterialError> {
  return materialRepository
    .findByIdForUser(userId, materialId)
    .andThen((material) => {
      if (!material) {
        return err(MaterialErrors.notFound());
      }
      if (material.deletedAt) {
        return err(MaterialErrors.notFound("삭제된 자료입니다."));
      }
      return ok(material);
    });
}
```

### 6.2. 조건부 에러 패턴

```typescript
// 다중 조건 검증
function validateMaterialAccess(
  userId: string,
  material: Material,
): Result<Material, MaterialError | CommonError> {
  if (material.userId !== userId) {
    return err(CommonErrors.forbidden("자료 접근 권한이 없습니다."));
  }

  if (material.deletedAt) {
    return err(MaterialErrors.notFound());
  }

  if (material.processingStatus !== "READY") {
    return err(MaterialErrors.notReady(material.id));
  }

  return ok(material);
}
```

### 6.3. 에러 매핑 패턴

```typescript
// Repository 에러를 도메인 에러로 변환
function createMaterial(
  input: CreateMaterialInput,
): ResultAsync<Material, MaterialError> {
  return materialRepository.insertMaterial(input).mapErr((repoError) => {
    // Repository 에러를 Material 도메인 에러로 변환
    if (repoError._tag === "InternalError") {
      return MaterialErrors.createFailed();
    }
    return repoError;
  });
}
```

---

## 7. 테스트 전략

### 7.1. 유닛 테스트

```typescript
import { describe, it, expect } from "vitest";
import { ok, err } from "neverthrow";
import { createMaterial } from "./create-material";

describe("createMaterial", () => {
  it("should return Ok with material on success", async () => {
    const result = await createMaterial(userId, validInput);

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.materialId).toBeDefined();
    }
  });

  it("should return Err with MaterialDuplicateError on duplicate", async () => {
    // Mock repository to return duplicate
    const result = await createMaterial(userId, duplicateInput);

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error._tag).toBe("MaterialDuplicateError");
      expect(result.error.code).toBe("MATERIAL_DUPLICATE");
    }
  });
});
```

### 7.2. 통합 테스트

```typescript
describe("POST /api/materials", () => {
  it("should return 409 on duplicate file", async () => {
    const response = await app.request("/api/materials", {
      method: "POST",
      body: JSON.stringify(duplicateInput),
    });

    expect(response.status).toBe(409);
    const body = await response.json();
    expect(body.error.code).toBe("MATERIAL_DUPLICATE");
  });
});
```

---

## 8. 주의사항 및 모범 사례

### 8.1. 피해야 할 패턴

```typescript
// ❌ _unsafeUnwrap() 사용 금지
const value = result._unsafeUnwrap();

// ❌ isErr() 후 throw로 변환하지 않기
if (result.isErr()) {
  throw new Error(result.error.message);
}

// ❌ 중첩된 Result 피하기
Result<Result<T, E1>, E2>; // Bad
```

### 8.2. 권장 패턴

```typescript
// ✅ match() 사용
result.match(
  (value) => handleSuccess(value),
  (error) => handleError(error),
);

// ✅ andThen()으로 체이닝
resultA
  .andThen((a) => operationB(a))
  .andThen((b) => operationC(b))
  .map((c) => transformResult(c));

// ✅ combine()으로 병렬 처리
Result.combine([resultA, resultB, resultC]).map(([a, b, c]) => ({ a, b, c }));
```

### 8.3. 에러 로깅 정책

```typescript
// 예상된 에러: 경고 레벨
if (error._tag === "ValidationError" || error._tag === "NotFoundError") {
  logger.warn({ error }, "Expected error occurred");
}

// 예상치 못한 에러: 에러 레벨
if (error._tag === "InternalError") {
  logger.error({ error }, "Unexpected error occurred");
}
```

---

## 9. 예상 효과

### 9.1. 장점

1. **타입 안전성**: 컴파일 타임에 에러 핸들링 누락 감지
2. **명시적 에러 흐름**: 함수 시그니처에서 가능한 에러 확인 가능
3. **함수형 체이닝**: 깔끔한 에러 전파 및 변환
4. **테스트 용이성**: Result 타입으로 에러 케이스 테스트 간편화

### 9.2. 트레이드오프

1. **학습 곡선**: 팀원들이 Result 패턴에 익숙해지는 데 시간 필요
2. **코드량 증가**: 초기에는 보일러플레이트 증가 (장기적으로 감소)
3. **마이그레이션 비용**: 기존 코드 변환에 리소스 투입 필요

---

## 10. 참고 자료

- [neverthrow GitHub](https://github.com/supermacro/neverthrow)
- [Railway Oriented Programming](https://fsharpforfunandprofit.com/rop/)
- [TypeScript Error Handling Best Practices](https://dev.to/effect/typescript-error-handling-patterns-best-practices-3c)
