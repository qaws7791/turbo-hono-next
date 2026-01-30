# Privacy 정책

## 개요

민감정보 대응, 로그 마스킹, PII 저장 기준을 정의합니다.

---

## PII (개인 식별 정보)

### 저장 허용

| 데이터         | 목적      | 암호화             |
| -------------- | --------- | ------------------ |
| email          | 인증      | ✗ (해시 검색 필요) |
| display_name   | 표시      | ✗                  |
| avatar_url     | 표시      | ✗                  |
| IP, User-Agent | 보안 로그 | ✗                  |

### 저장 금지

- 결제 정보 (해당 없음)
- 주민번호 등 민감 정보

---

## 업로드 문서 내 민감정보

### 원칙

- 사용자 책임하에 업로드
- 시스템은 문서 내용을 검열하지 않음
- AI 응답에서 민감정보 노출 시 사용자 책임

### 향후 대응 (선택)

- 업로드 시 민감정보 감지 경고
- LLM 응답 필터링

---

## 로그 마스킹

### 마스킹 대상

```typescript
const maskFields = ["email", "token", "password", "session"];

function maskLog(obj: any) {
  return JSON.stringify(obj, (key, value) => {
    if (maskFields.includes(key)) return "***";
    return value;
  });
}
```

### 예시

```
// Before
{ email: "user@example.com", token: "abc123" }

// After
{ email: "***", token: "***" }
```

---

## 관련 문서

- [Data Retention](./data-retention.md)
- [인증 API](../api/auth.md)
