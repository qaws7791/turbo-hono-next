# 에러 코드 체계

## 개요

이 문서는 API 에러 코드 체계, 프론트엔드에서의 처리 가이드, Validation 오류 포맷을 정의합니다.

---

## 에러 응답 구조

```typescript
interface ErrorResponse {
  error: {
    code: string; // 머신 처리용 코드
    message: string; // 사용자용 메시지
    details?: Record<string, any>; // 추가 정보
    validation?: ValidationError[]; // 입력 검증 오류
  };
}

interface ValidationError {
  field: string; // 필드명 (dot notation)
  code: string; // 검증 에러 코드
  message: string; // 메시지
}
```

---

## 에러 코드 네이밍

### 형식

```
{DOMAIN}_{ACTION}_{REASON}
```

### 예시

| 코드                      | 설명                 |
| ------------------------- | -------------------- |
| MATERIAL_NOT_FOUND        | Material 리소스 없음 |
| PLAN_CREATION_FAILED      | Plan 생성 실패       |
| SESSION_ALREADY_COMPLETED | Session 이미 완료됨  |

---

## HTTP 상태 코드별 에러

### 400 Bad Request

잘못된 요청 형식

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "요청 형식이 올바르지 않습니다.",
    "details": {
      "expected": "JSON",
      "received": "form-data"
    }
  }
}
```

### 401 Unauthorized

인증 필요 또는 실패

| 코드            | 메시지                   | 처리               |
| --------------- | ------------------------ | ------------------ |
| UNAUTHORIZED    | 로그인이 필요합니다      | 로그인 페이지 이동 |
| SESSION_EXPIRED | 세션이 만료되었습니다    | 로그인 페이지 이동 |
| INVALID_TOKEN   | 유효하지 않은 토큰입니다 | 로그인 페이지 이동 |

### 403 Forbidden

권한 없음

| 코드                | 메시지                          | 처리             |
| ------------------- | ------------------------------- | ---------------- |
| FORBIDDEN           | 접근 권한이 없습니다            | 에러 페이지 표시 |
| SPACE_ACCESS_DENIED | 이 Space에 접근할 수 없습니다   | 홈으로 이동      |
| RESOURCE_OWNER_ONLY | 리소스 소유자만 접근 가능합니다 | 에러 표시        |

### 404 Not Found

리소스 없음

| 코드               | 메시지                     |
| ------------------ | -------------------------- |
| SPACE_NOT_FOUND    | Space를 찾을 수 없습니다   |
| MATERIAL_NOT_FOUND | 자료를 찾을 수 없습니다    |
| PLAN_NOT_FOUND     | Plan을 찾을 수 없습니다    |
| SESSION_NOT_FOUND  | 세션을 찾을 수 없습니다    |
| CONCEPT_NOT_FOUND  | Concept을 찾을 수 없습니다 |

### 409 Conflict

리소스 충돌

| 코드                | 메시지                        |
| ------------------- | ----------------------------- |
| PLAN_ALREADY_ACTIVE | 이미 활성화된 Plan이 있습니다 |
| SESSION_IN_PROGRESS | 진행 중인 세션이 있습니다     |
| MATERIAL_DUPLICATE  | 동일한 파일이 이미 존재합니다 |

### 422 Unprocessable Entity

입력 검증 실패

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "입력값이 올바르지 않습니다.",
    "validation": [
      {
        "field": "email",
        "code": "INVALID_EMAIL",
        "message": "올바른 이메일 형식이 아닙니다."
      },
      {
        "field": "materialIds",
        "code": "ARRAY_TOO_LONG",
        "message": "최대 5개까지 선택 가능합니다."
      }
    ]
  }
}
```

### 429 Too Many Requests

요청 한도 초과

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.",
    "details": {
      "retryAfter": 60
    }
  }
}
```

### 500 Internal Server Error

서버 오류

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "서버에서 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
    "details": {
      "requestId": "req_abc123"
    }
  }
}
```

---

## 도메인별 에러 코드

### Material (자료)

| 코드                      | HTTP | 설명                    |
| ------------------------- | ---- | ----------------------- |
| MATERIAL_NOT_FOUND        | 404  | 자료 없음               |
| MATERIAL_NOT_READY        | 400  | 분석 미완료             |
| MATERIAL_PROCESSING       | 400  | 분석 중                 |
| MATERIAL_FAILED           | 400  | 분석 실패               |
| MATERIAL_FILE_TOO_LARGE   | 400  | 파일 크기 초과          |
| MATERIAL_UNSUPPORTED_TYPE | 400  | 지원하지 않는 파일 형식 |

### Plan

| 코드                    | HTTP | 설명                       |
| ----------------------- | ---- | -------------------------- |
| PLAN_NOT_FOUND          | 404  | Plan 없음                  |
| PLAN_ALREADY_ACTIVE     | 409  | 이미 Active Plan 존재      |
| PLAN_CREATION_FAILED    | 500  | 생성 실패                  |
| PLAN_MATERIAL_NOT_READY | 400  | 선택된 자료 중 미완료 존재 |
| PLAN_MATERIAL_LIMIT     | 400  | 자료 선택 한도 초과        |

### Session

| 코드                      | HTTP | 설명                 |
| ------------------------- | ---- | -------------------- |
| SESSION_NOT_FOUND         | 404  | 세션 없음            |
| SESSION_ALREADY_COMPLETED | 400  | 이미 완료된 세션     |
| SESSION_NOT_SCHEDULED     | 400  | 스케줄되지 않은 세션 |
| SESSION_RUN_EXISTS        | 409  | 진행 중인 Run 존재   |

### AI/Chat

| 코드                   | HTTP | 설명                  |
| ---------------------- | ---- | --------------------- |
| AI_SERVICE_UNAVAILABLE | 503  | AI 서비스 불가        |
| AI_RATE_LIMIT          | 429  | AI 호출 한도 초과     |
| AI_CONTEXT_TOO_LARGE   | 400  | 컨텍스트 크기 초과    |
| RAG_NO_RESULTS         | 200  | 관련 문서 없음 (정상) |

---

## Validation 에러 코드

### 공통

| 코드           | 설명           |
| -------------- | -------------- |
| REQUIRED       | 필수 필드 누락 |
| INVALID_TYPE   | 타입 불일치    |
| INVALID_FORMAT | 형식 불일치    |

### 문자열

| 코드             | 설명               |
| ---------------- | ------------------ |
| STRING_TOO_SHORT | 최소 길이 미달     |
| STRING_TOO_LONG  | 최대 길이 초과     |
| INVALID_EMAIL    | 이메일 형식 불일치 |
| INVALID_URL      | URL 형식 불일치    |

### 배열

| 코드            | 설명            |
| --------------- | --------------- |
| ARRAY_EMPTY     | 배열이 비어있음 |
| ARRAY_TOO_SHORT | 최소 개수 미달  |
| ARRAY_TOO_LONG  | 최대 개수 초과  |

### 숫자

| 코드               | 설명        |
| ------------------ | ----------- |
| NUMBER_TOO_SMALL   | 최소값 미달 |
| NUMBER_TOO_LARGE   | 최대값 초과 |
| NUMBER_NOT_INTEGER | 정수가 아님 |

---

## 프론트엔드 처리 가이드

### 에러 핸들러

```typescript
// utils/errorHandler.ts
export function handleApiError(error: ErrorResponse) {
  const { code, message } = error.error;

  switch (code) {
    // 인증 에러 → 로그인 페이지
    case "UNAUTHORIZED":
    case "SESSION_EXPIRED":
      router.push("/login");
      toast.info("로그인이 필요합니다");
      break;

    // 권한 에러 → 에러 표시
    case "FORBIDDEN":
    case "SPACE_ACCESS_DENIED":
      toast.error(message);
      break;

    // 리소스 없음 → 404 페이지
    case "SPACE_NOT_FOUND":
    case "PLAN_NOT_FOUND":
      router.push("/404");
      break;

    // 검증 에러 → 폼 에러 표시
    case "VALIDATION_ERROR":
      return error.error.validation; // 폼에서 처리

    // 서버 에러 → 재시도 유도
    case "INTERNAL_ERROR":
      toast.error("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      break;

    // 기타 → 메시지 표시
    default:
      toast.error(message);
  }
}
```

### 재시도 정책

| 에러 코드              | 재시도   | 대기 시간     |
| ---------------------- | -------- | ------------- |
| INTERNAL_ERROR         | 최대 3회 | 지수 백오프   |
| AI_SERVICE_UNAVAILABLE | 최대 2회 | 5초           |
| RATE_LIMIT_EXCEEDED    | 1회      | retryAfter 초 |
| 그 외                  | 안함     | -             |

---

## 구현 예시

### Zod 에러 변환

```typescript
// utils/zodErrorTransform.ts
import { ZodError } from "zod";

export function transformZodError(error: ZodError): ValidationError[] {
  return error.errors.map((e) => ({
    field: e.path.join("."),
    code: mapZodCodeToErrorCode(e.code),
    message: e.message,
  }));
}

function mapZodCodeToErrorCode(zodCode: string): string {
  const mapping: Record<string, string> = {
    too_small: "STRING_TOO_SHORT",
    too_big: "STRING_TOO_LONG",
    invalid_type: "INVALID_TYPE",
    invalid_string: "INVALID_FORMAT",
  };
  return mapping[zodCode] || zodCode.toUpperCase();
}
```

### 에러 미들웨어

```typescript
// middleware/errorHandler.ts
export const errorHandler = (err: Error, c: Context) => {
  console.error(`[${c.get("requestId")}]`, err);

  if (err instanceof ZodError) {
    return c.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "입력값이 올바르지 않습니다.",
          validation: transformZodError(err),
        },
      },
      422,
    );
  }

  if (err instanceof AppError) {
    return c.json(
      {
        error: {
          code: err.code,
          message: err.message,
          details: err.details,
        },
      },
      err.statusCode,
    );
  }

  return c.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "서버에서 오류가 발생했습니다.",
        details: { requestId: c.get("requestId") },
      },
    },
    500,
  );
};
```

---

## 관련 문서

- [API 개요](./overview.md)
- [인증](./auth.md)
