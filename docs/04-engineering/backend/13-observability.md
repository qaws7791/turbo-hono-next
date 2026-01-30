# Observability

## 개요

로깅, 메트릭, 추적을 통한 **시스템 가시성 확보**. 문제 감지, 디버깅, 성능 최적화를 위한 기반.

## 설계 결정

### 1. Structured Logging (구조화된 로깅)

**결정**: JSON 형식의 구조화 로그 (Pino)

**로그 필드**:

```
- timestamp: ISO 8601
- level: info | warn | error
- requestId: 요청 추적 ID
- userId: 인증된 사용자 (선택적)
- method/path/status: HTTP 컨텍스트
- durationMs: 응답 시간
- message: 로그 메시지
- ... 추가 컨텍스트
```

**근거**:

- **Queryability**: JSON 형식으로 로그 aggregation 용이
- **Consistency**: 일관된 필드로 검색/필터링 가능
- **Performance**: Pino의 고성능 JSON 직렬화
- **Correlation**: requestId로 분산 추적

### 2. Request ID Propagation

**결정**: 모든 요청에 고유 ID 부여 및 전파

**흐름**:

```
Client Request (또는 생성)
  ↓
[requestIdMiddleware] - 헤더 또는 생성
  ↓
[loggerMiddleware] - 모든 로그에 포함
  ↓
Route Handler
  ↓
Core Service
  ↓
Response (X-Request-ID 헤더로 반환)
```

**근거**:

- **Debugging**: 단일 요청의 전체 흐름 추적
- **Support**: 사용자 문의 시 requestId로 로그 검색
- **Distributed tracing**: 향후 분산 추적 기반

## 로그 레벨 정책

### INFO

**상황**: 정상적인 요청/응답, 비즈니스 이벤트

```
- request.start/end
- material.created
- plan.generated
- session.started/completed
```

### WARN

**상황**: 클라이언트 에러, 재시도 가능한 문제

```
- request.api_error (4xx)
- rate_limit.exceeded
- auth.failed
- job.failed (재시도 예정)
```

### ERROR

**상황**: 서버 에러, 즉시 조치 필요

```
- request.error (5xx)
- database.connection_failed
- ai.api_error
- queue.worker_crashed
```

## 메트릭 수집

### API 메트릭

| 메트릭                    | 설명           | 활용                    |
| ------------------------- | -------------- | ----------------------- |
| `api_request_duration_ms` | 요청 처리 시간 | P95/P99 latency 분석    |
| `api_request_count`       | 요청 수        | throughput, 에러율 계산 |
| `api_error_count`         | 에러 수        | availability SLO 계산   |

### AI/Gemini 메트릭

| 메트릭                       | 설명              | 활용                        |
| ---------------------------- | ----------------- | --------------------------- |
| `gemini_request_duration_ms` | API 응답 시간     | timeout 설정, fallback 결정 |
| `gemini_token_count`         | 요청/응답 토큰 수 | 비용 예측, rate limit       |
| `gemini_error_count`         | API 실패 수       | 재시도 정책 조정            |

### 비즈니스 메트릭

| 메트릭                    | 설명           | 활용          |
| ------------------------- | -------------- | ------------- |
| `plan_generation_count`   | 계획 생성 수   | 기능 사용률   |
| `session_completion_rate` | 세션 완료율    | 학습 참여도   |
| `material_upload_count`   | 자료 업로드 수 | 콘텐츠 증가율 |

## 추적 (Tracing)

### 현재 구현

**Request-level**: requestId로 단일 요청 추적

### 향후 확장

**Distributed tracing**:

```
- API Server → Core Service
- Core Service → AI Adapter
- AI Adapter → Gemini API
- Core Service → Database
```

**OpenTelemetry** 도입 검토

## 알림 기준

### ERROR 레벨 알림

| 조건              | 채널  | 조치             |
| ----------------- | ----- | ---------------- |
| 5xx 에러율 > 1%   | Slack | 즉시 조사        |
| Job 실패율 > 10%  | Slack | 재시도 정책 확인 |
| AI API 실패 > 20% | Slack | API 상태 확인    |

### WARN 레벨 알림

| 조건                 | 채널  | 조치                |
| -------------------- | ----- | ------------------- |
| Rate limit 초과 빈발 | Slack | 공격/버그 여부 확인 |
| 평균 응답 시간 > 2s  | Slack | 성능 병목 조사      |

## 보이지 않는 규칙

1. **Never log sensitive data**: 비밀번호, 토큰, 개인정보 금지
2. **Always include requestId**: 모든 로그에 추적 ID 필수
3. **Log at boundaries**: 요청 시작/끝, 외부 API 호출, DB 쿼리
4. **Structured over text**: `userId: xxx` vs `"user xxx logged in"`
5. **Sample in production**: 100% 로깅은 비용, 적절히 샘플링

## 개인정보 보호 (Privacy)

### 로깅 금지 항목

- 비밀번호, API 키, 세션 토큰
- 이메일 주소 (전체)
- 전화번호, 주소 등 개인정보
- 파일 내용 (청크 텍스트)

### 마스킹/해싱

```
이메일: user@example.com → user@***.com
IP: 192.168.1.1 → 해시값 (식별용)
```

## 참고 문서

- [middleware/logger.ts](../../../apps/api/src/middleware/logger.ts) - 로깅 미들웨어
- [Error Handling](./02-error-handling.md) - 에러 로깅
