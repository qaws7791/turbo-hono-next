# API 설계 원칙

이 문서는 API 설계 철학, 공통 규약, 그리고 Scalar 문서와의 역할 분리를 정의합니다.

**참고**: 모든 엔드포인트 상세는 [Scalar API 문서](/docs)에서 확인하세요.

---

## 설계 철학

### 1. 타입 안전성 우선

- 모든 입출력은 Zod로 검증
- zod-openapi로 스펙과 코드 동기화
- 프론트-백 타입 공유 (`packages/api-spec`)

### 2. 일관된 인터페이스

- 동일한 에러 응답 구조
- 예측 가능한 HTTP 상태 코드
- 표준화된 페이지네이션/정렬/필터링

### 3. 비즈니스 규칙 노출

- API는 도메인 규칙을 반영
- 상태 전이는 서버에서 검증
- 클라이언트는 UI 흐름에 집중

---

## 공통 규약

### URL 규칙

| 규칙          | 예시                                                  | 근거                     |
| ------------- | ----------------------------------------------------- | ------------------------ |
| 복수형 리소스 | `/api/materials`, `/api/plans`                        | REST 관례, 직관적        |
| kebab-case    | `/plan-sessions`                                      | URL 가독성               |
| ID는 UUID     | `/api/materials/550e8400-e29b-41d4-a716-446655440000` | 분산 시스템, 예측 불가능 |

### HTTP 메서드

| 메서드 | 용도      | 멱등성 | 설명                        |
| ------ | --------- | ------ | --------------------------- |
| GET    | 조회      | ✓      | 캐시 가능, 안전             |
| POST   | 생성      | ✗      | 새 리소스 생성, 부작용 허용 |
| PUT    | 전체 교체 | ✓      | 기존 리소스 완전 대체       |
| PATCH  | 부분 수정 | ✓      | 일부 필드 업데이트          |
| DELETE | 삭제      | ✓      | 소프트/하드 삭제 모두 가능  |

### 버전 관리

현재는 URL에 버전 없음 (`/api/materials`). 필요시 도입 검토.

| 변경 타입   | 정책               |
| ----------- | ------------------ |
| Major       | 버전 도입/증가     |
| Minor       | 필드 추가 허용     |
| Deprecation | 3개월 유지 후 제거 |

---

## 응답/에러 포맷

### 성공 응답

```typescript
// 단일 리소스
{
  data: { id, type, attributes }
}

// 목록
{
  data: [...],
  meta: { total, page, limit, totalPages }
}
```

### 에러 응답

```typescript
{
  error: {
    code: "MATERIAL_NOT_FOUND",      // 머신용
    message: "자료를 찾을 수 없습니다.", // 사용자용
    details: { materialId },         // 추가 컨텍스트
    validation?: [...]               // 검증 오류시
  }
}
```

---

## 페이지네이션

Offset 기반, 1-indexed.

```
GET /api/materials?page=1&limit=20
```

| 파라미터 | 기본값 | 최대 | 설명        |
| -------- | ------ | ---- | ----------- |
| page     | 1      | -    | 1부터 시작  |
| limit    | 20     | 100  | 페이지 크기 |

---

## 정렬

```
GET /api/materials?sort=createdAt:desc
GET /api/materials?sort=status:asc,createdAt:desc  // 복합
```

---

## 필터링

```
GET /api/materials?status=READY                    // 단순
GET /api/materials?status=READY&sourceType=FILE    // 복합
GET /api/materials?search=react                    // 검색
```

---

## 요청/응답 헤더

### 필수 요청 헤더

| 헤더         | 값               |
| ------------ | ---------------- |
| Content-Type | application/json |
| Accept       | application/json |

### 인증

| 헤더   | 값          | 설명               |
| ------ | ----------- | ------------------ |
| Cookie | session=... | httpOnly 세션 쿠키 |

### 선택적 헤더

| 헤더            | 값   | 용도           |
| --------------- | ---- | -------------- |
| Idempotency-Key | uuid | 중복 요청 방지 |
| X-Request-ID    | uuid | 요청 추적      |

### 응답 헤더

| 헤더           | 설명            |
| -------------- | --------------- |
| X-Request-ID   | 요청 ID (로깅)  |
| X-RateLimit-\* | Rate Limit 정보 |

---

## 모듈별 설계 문서

| 주제 | 문서                           | 내용                        |
| ---- | ------------------------------ | --------------------------- |
| 인증 | [auth.md](./auth.md)           | 보안 정책, 세션 관리        |
| 에러 | [errors.md](./errors.md)       | 에러 코드 체계, 처리 가이드 |
| 자료 | [materials.md](./materials.md) | 처리 파이프라인, 상태 전이  |
| 계획 | [plans.md](./plans.md)         | 상태 머신, 비즈니스 규칙    |
| 세션 | [sessions.md](./sessions.md)   | 라이프사이클, 복구 메커니즘 |
| 채팅 | [chat.md](./chat.md)           | RAG 스코프, Citation        |

---

## 관련 문서

- [시스템 아키텍처](../architecture.md)
- [Scalar API 문서](/docs)
