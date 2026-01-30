# 에러 처리

API 에러 코드 체계, 프론트엔드 처리 가이드, neverthrow 사용법을 설명합니다.

---

## 에러 응답 구조

```typescript
interface ErrorResponse {
  error: {
    code: string; // 머신용 (대문자_스네이크)
    message: string; // 사용자용
    details?: Record<string, any>; // 추가 컨텍스트
    validation?: ValidationError[]; // 검증 오류시
  };
}

interface ValidationError {
  field: string; // dot notation (e.g., "user.email")
  code: string; // 검증 에러 코드
  message: string; // 필드별 메시지
}
```

---

## 에러 코드 네이밍

### 형식

```
{DOMAIN}_{ACTION}_{REASON}
```

### 예시

| 코드                      | 도메인   | 상황        |
| ------------------------- | -------- | ----------- |
| MATERIAL_NOT_FOUND        | Material | 리소스 없음 |
| PLAN_CREATION_FAILED      | Plan     | 생성 실패   |
| SESSION_ALREADY_COMPLETED | Session  | 이미 완료됨 |
| UNAUTHORIZED              | Common   | 인증 필요   |

---

## HTTP 상태 코드 매핑

| 코드 | 에러 유형      | 예시 코드           |
| ---- | -------------- | ------------------- |
| 400  | 잘못된 요청    | INVALID_REQUEST     |
| 401  | 인증 실패      | UNAUTHORIZED        |
| 403  | 권한 없음      | FORBIDDEN           |
| 404  | 리소스 없음    | MATERIAL_NOT_FOUND  |
| 409  | 충돌           | SESSION_IN_PROGRESS |
| 422  | 검증 실패      | VALIDATION_ERROR    |
| 429  | 요청 한도 초과 | RATE_LIMIT_EXCEEDED |
| 500  | 서버 오류      | INTERNAL_ERROR      |

---

## 도메인별 에러 코드

### Material

| 코드                         | HTTP | 설명                  |
| ---------------------------- | ---- | --------------------- |
| MATERIAL_NOT_FOUND           | 404  | 자료 없음             |
| MATERIAL_NOT_READY           | 400  | 분석 미완료           |
| MATERIAL_FILE_TOO_LARGE      | 400  | 파일 크기 초과 (50MB) |
| MATERIAL_UNSUPPORTED_TYPE    | 400  | 지원하지 않는 형식    |
| MATERIAL_DUPLICATE           | 409  | 중복 자료             |
| MATERIAL_PARSE_FAILED        | 400  | 파일 파싱 실패        |
| UPLOAD_NOT_FOUND             | 404  | 업로드 세션 없음      |
| UPLOAD_ALREADY_COMPLETED     | 409  | 이미 완료된 업로드    |
| UPLOAD_EXPIRED               | 410  | 업로드 URL 만료       |
| UPLOAD_INVALID_STATE         | 400  | 잘못된 업로드 상태    |
| UPLOAD_OBJECT_NOT_FOUND      | 404  | 저장소에 파일 없음    |
| UPLOAD_SIZE_MISMATCH         | 400  | 파일 크기 불일치      |
| UPLOAD_CONTENT_TYPE_MISMATCH | 400  | 파일 형식 불일치      |
| UPLOAD_ETAG_MISMATCH         | 400  | 체크섬 불일치         |
| JOB_NOT_FOUND                | 404  | 작업 없음             |
| QUEUE_UNAVAILABLE            | 503  | 큐 서비스 사용 불가   |

### Plan

| 코드                        | HTTP | 설명                      |
| --------------------------- | ---- | ------------------------- |
| PLAN_NOT_FOUND              | 404  | Plan 없음                 |
| PLAN_MATERIAL_NOT_READY     | 400  | 자료 중 미분석 존재       |
| PLAN_MATERIAL_LIMIT         | 400  | 자료 5개 초과             |
| PLAN_CREATE_FAILED          | 500  | Plan 생성 실패            |
| PLAN_GENERATION_FAILED      | 500  | AI 생성 실패              |
| AI_PLAN_STRUCTURE_FAILED    | 502  | AI 구조 생성 실패         |
| AI_MODULE_POPULATION_FAILED | 502  | AI 모듈 생성 실패         |
| EMPTY_MATERIAL_CHUNKS       | 400  | 자료에서 콘텐츠 추출 실패 |

### Session

| 코드                      | HTTP | 설명              |
| ------------------------- | ---- | ----------------- |
| SESSION_NOT_FOUND         | 404  | 세션 없음         |
| SESSION_ALREADY_COMPLETED | 409  | 이미 완료됨       |
| IDEMPOTENCY_KEY_CONFLICT  | 409  | 멱등성 키 충돌    |
| AI_GENERATION_FAILED      | 502  | AI 세션 생성 실패 |
| INVALID_REQUEST           | 400  | 잘못된 요청       |
| VALIDATION_ERROR          | 422  | 검증 오류         |

### Auth

| 코드                                | HTTP | 설명                     |
| ----------------------------------- | ---- | ------------------------ |
| UNAUTHORIZED                        | 401  | 인증 필요                |
| SESSION_EXPIRED                     | 401  | 세션 만료                |
| FORBIDDEN                           | 403  | 접근 권한 없음           |
| MAGIC_LINK_EXPIRED                  | 400  | 매직링크 만료            |
| MAGIC_LINK_USED                     | 400  | 이미 사용된 매직링크     |
| MAGIC_LINK_INVALID                  | 400  | 잘못된 매직링크          |
| INVALID_REDIRECT                    | 400  | 허용되지 않은 리다이렉트 |
| GOOGLE_OAUTH_NOT_CONFIGURED         | 500  | Google OAuth 미설정      |
| GOOGLE_TOKEN_EXCHANGE_FAILED        | 502  | 토큰 교환 실패           |
| GOOGLE_USERINFO_FAILED              | 502  | 사용자 정보 조회 실패    |
| GOOGLE_EMAIL_NOT_VERIFIED           | 400  | 이메일 미인증            |
| GOOGLE_ID_TOKEN_INVALID             | 401  | 잘못된 ID 토큰           |
| GOOGLE_ID_TOKEN_INVALID_ISSUER      | 401  | 잘못된 토큰 발급자       |
| GOOGLE_ID_TOKEN_MISSING_CLAIMS      | 400  | 토큰 클레임 누락         |
| GOOGLE_ID_TOKEN_VERIFICATION_FAILED | 401  | 토큰 검증 실패           |
| USER_CREATE_FAILED                  | 500  | 사용자 생성 실패         |
| SESSION_CREATE_FAILED               | 500  | 세션 생성 실패           |
| AUTH_ACCOUNT_CREATE_FAILED          | 500  | 인증 계정 생성 실패      |

### Common

| 코드                | HTTP | 설명             |
| ------------------- | ---- | ---------------- |
| INTERNAL_ERROR      | 500  | 내부 서버 오류   |
| VALIDATION_ERROR    | 422  | 입력값 검증 오류 |
| RATE_LIMIT_EXCEEDED | 429  | 요청 한도 초과   |
| QUEUE_UNAVAILABLE   | 503  | 큐 서비스 불가   |
| CONFIG_ERROR        | 500  | 설정 오류        |

---

## 프론트엔드 처리 가이드

### 에러 핸들러 예시

```typescript
function handleApiError(error: ErrorResponse) {
  const { code, message, validation } = error.error;

  switch (code) {
    case "UNAUTHORIZED":
    case "SESSION_EXPIRED":
      router.push("/login");
      break;

    case "VALIDATION_ERROR":
      return validation; // 폼에 전달

    case "PLAN_NOT_FOUND":
      router.push("/404");
      break;

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

---

## neverthrow 사용 가이드

타입 안전한 에러 처리를 위한 `Result<T, E>` 패턴.

### 기본 사용법

```typescript
import { ok, err, Result, ResultAsync } from "neverthrow";

// 동기 함수
function findUser(id: string): Result<User, NotFoundError> {
  const user = users.get(id);
  return user ? ok(user) : err({ code: "USER_NOT_FOUND" });
}

// 비동기 함수
function findUserAsync(id: string): ResultAsync<User, DbError> {
  return ResultAsync.fromPromise(
    db.users.findUnique({ where: { id } }),
    (e) => ({ code: "DB_ERROR", message: String(e) }),
  ).andThen((user) => (user ? ok(user) : err({ code: "USER_NOT_FOUND" })));
}
```

### 체이닝 패턴

```typescript
validateInput(body)
  .andThen((input) => checkPermission(user, input))
  .andThen((input) => createRecord(input))
  .map((record) => transform(record))
  .mapErr((error) => logAndEnrich(error));
```

### 결과 처리

```typescript
// match로 분기
result.match(
  (data) => c.json({ data }, 200),
  (error) => c.json({ error }, error.status),
);

// 또는 unwrap (주의: 에러시 예외)
const data = result._unsafeUnwrap();
```

### 주의사항

- ✅ `match()` 사용 권장
- ✅ `andThen()`으로 체이닝
- ❌ `_unsafeUnwrap()` 지양
- ❌ 중첩된 Result 피하기

**상세 계획**: [neverthrow 구현 계획](./neverthrow-implementation-plan.md)

---

## 관련 문서

- [API 개요](./overview.md)
- [인증](./auth.md)
- [neverthrow 구현 계획](./neverthrow-implementation-plan.md)
