# Error Handling Strategy

## 철학

**"Errors are values"** - 예외는 예외적인 상황에서만 발생. 비즈니스 로직의 분기는 명시적인 타입으로 표현.

## 결정: Result Pattern over try/catch

**neverthrow** 라이브러리를 사용한 함수형 에러 처리.

### Result Pattern 선택 이유

| 측면              | try/catch              | Result Pattern               |
| ----------------- | ---------------------- | ---------------------------- |
| **타입 안전**     | catch 타입이 `unknown` | 에러 타입이 명시적           |
| **조합성**        | 체이닝 어려움          | `map`, `flatMap` 가능        |
| **명시성**        | 에러 흐름이 암시적     | `isOk()`, `isErr()`로 명시적 |
| **테스트 용이성** | 예외 발생 여부 불명확  | 반환 타입으로 명확           |

## 에러 타입 계층

### Core Error

```typescript
// packages/core/common/core-error.ts
export interface CoreError {
  readonly _tag: "CoreError";
  readonly code: string; // MACHINE_READABLE_CODE
  readonly message: string; // USER_FRIENDLY_MESSAGE
  readonly cause?: unknown; // DEBUG_INFO
}
```

### 에러 코드 네이밍

**계층적 네이밍** 규칙:

```
Domain prefix (e.g., MATERIAL_, PLAN_)
    ↓
Specific error (e.g., NOT_FOUND, ALREADY_EXISTS)
    ↓
Full code: MATERIAL_NOT_FOUND, PLAN_GENERATION_FAILED
```

**카테고리**:

| Prefix      | Domain      | Examples                                      |
| ----------- | ----------- | --------------------------------------------- |
| `AUTH_`     | 인증        | `UNAUTHORIZED`, `SESSION_EXPIRED`             |
| `MATERIAL_` | 학습 자료   | `NOT_FOUND`, `FILE_TOO_LARGE`, `PARSE_FAILED` |
| `PLAN_`     | 학습 계획   | `NOT_FOUND`, `GENERATION_FAILED`              |
| `SESSION_`  | 학습 세션   | `RUN_NOT_FOUND`, `ALREADY_COMPLETED`          |
| `QUEUE_`    | 작업 큐     | `UNAVAILABLE`, `ADD_FAILED`                   |
| `AI_`       | AI 서비스   | `RESPONSE_INVALID`, `EMBEDDING_FAILED`        |
| `UPLOAD_`   | 파일 업로드 | `INVALID_STATE`, `URL_EXPIRED`                |

## 레이어별 에러 처리

### 1. Core Layer

**모든 실패는 `Result<Ok, CoreError>`로 반환**:

```typescript
// ✅ Core는 never throw
export async function getMaterialDetail(
  id: string,
): Promise<Result<Material, CoreError>> {
  const material = await repository.findById(id);

  if (!material) {
    return err({
      _tag: "CoreError",
      code: "MATERIAL_NOT_FOUND",
      message: "학습 자료를 찾을 수 없습니다.",
    });
  }

  return ok(material);
}
```

### 2. API Layer

**Result → HTTP Response 변환**:

```typescript
// lib/result-handler.ts
export function handleResult<T>(
  result: Result<T, AppError>,
  onSuccess: (data: T) => Response,
): Response {
  if (result.isErr()) {
    throwAppError(result.error); // 미들웨어에서 처리
  }
  return onSuccess(result.value);
}
```

**Route handler 사용 패턴**:

```typescript
app.openapi(route, async (c) => {
  const result = await deps.services.material.getDetail(id);

  // 패턴 1: 간단한 변환
  return handleResult(result, (data) => c.json({ data }, 200));

  // 패턴 2: 추가 로직 필요시
  return handleResult(result, (data) => {
    const transformed = transformForResponse(data);
    return c.json({ data: transformed }, 200);
  });
});
```

### 3. Error Handler Middleware

**모든 에러는 중앙에서 처리**:

```
에러 발생
  ↓
throwAppError(error)  (API layer)
  ↓
app.onError(handler)  (Hono)
  ↓
toApiErrorResponse(error) → JSON response
```

**에러 타입별 처리**:

| Error Type  | HTTP Status        | Response                  |
| ----------- | ------------------ | ------------------------- |
| `ApiError`  | status 필드 사용   | code, message, details    |
| `ZodError`  | 422                | validation 배열 포함      |
| `CoreError` | code → status 매핑 | message, cause (dev only) |
| `Unknown`   | 500                | INTERNAL_ERROR, requestId |

### HTTP Status Code Mapping

**코드 → 상태 매핑 규칙**:

```typescript
function coreErrorCodeToStatus(code: string): ContentfulStatusCode {
  // 인증/인가
  if (code === "UNAUTHORIZED") return 401;
  if (code === "FORBIDDEN") return 403;

  // 리소스 상태
  if (code.endsWith("_NOT_FOUND")) return 404;
  if (code.endsWith("_ALREADY_EXISTS")) return 409;
  if (code.endsWith("_EXPIRED")) return 410;

  // 유효성
  if (code === "VALIDATION_ERROR") return 422;
  if (code.endsWith("_NOT_READY")) return 400;

  // 외부 서비스
  if (code.startsWith("QUEUE_")) return 503;
  if (code.startsWith("AI_")) return 502;

  return 500;
}
```

## 에러 응답 형식

### 표준 에러 응답

```json
{
  "error": {
    "code": "MATERIAL_NOT_FOUND",
    "message": "학습 자료를 찾을 수 없습니다.",
    "details": {
      "materialId": "mat_abc123"
    },
    "validation": null
  }
}
```

### Validation Error (Zod)

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "입력값이 올바르지 않습니다.",
    "validation": [
      {
        "field": "email",
        "code": "INVALID_FORMAT",
        "message": "올바른 이메일 형식이 아닙니다."
      }
    ]
  }
}
```

### Internal Error (Production)

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "서버에서 오류가 발생했습니다.",
    "details": {
      "requestId": "req_abc123"
    }
  }
}
```

## 에러 로깅

### 로그 레벨

| 에러 타입             | 로그 레벨 | 이유                   |
| --------------------- | --------- | ---------------------- |
| 클라이언트 에러 (4xx) | `warn`    | 개발자/클라이언트 문제 |
| 서버 에러 (5xx)       | `error`   | 즉시 조치 필요         |
| 검증 에러 (422)       | `info`    | 정상적인 입력 오류     |

### 로그 형식

```typescript
logger.warn(
  {
    requestId,
    method: c.req.method,
    path: c.req.path,
    status: error.status,
    code: error.code,
    details: error.details,
  },
  "request.api_error",
);
```

## 모범 사례

### DO

- ✅ **구체적인 에러 코드**: `MATERIAL_NOT_FOUND` > `NOT_FOUND`
- ✅ **사용자 친화적 메시지**: "학습 자료를 찾을 수 없습니다."
- ✅ **디버그 정보는 details에**: `cause`, `stack` 등
- ✅ **Result 타입 명시**: `Promise<Result<Data, MaterialError>>`

### DON'T

- ❌ **직접 throw**: `throw new Error()` 금지 (미들웨어 제외)
- ❌ **암시적 에러 변환**: `catch (e) { return err(e) }` 금지
- ❌ **민감정보 노출**: 스택 트레이스는 production에서 제거
- ❌ **빈 catch**: 반드시 처리

## 참고 문서

- [result.ts](../../../apps/api/src/lib/result.ts) - 에러 변환 로직
- [error-handler.ts](../../../apps/api/src/middleware/error-handler.ts) - 미들웨어 구현
- [packages/core/common/core-error.ts](../../../packages/core/src/common/core-error.ts) - Core 에러 정의
