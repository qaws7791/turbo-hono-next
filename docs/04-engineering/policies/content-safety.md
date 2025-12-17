# Content Safety 정책

## 개요

사용자 입력/업로드에 대한 안전 정책, 모델 응답 필터링 원칙을 정의합니다.

---

## 입력 안전

### 금지/제한 범주

MVP에서는 별도 필터링 없이 OpenAI 기본 필터 의존

### 향후 대응

| 범주        | 대응               |
| ----------- | ------------------ |
| 성인 콘텐츠 | 업로드 거부        |
| 혐오 표현   | 업로드 거부        |
| 불법 정보   | 업로드 거부 + 로깅 |

---

## 모델 응답 필터링

### OpenAI 기본 필터

- content_filter 결과 확인
- 필터링된 응답 시 대체 메시지

```typescript
if (response.choices[0].finish_reason === "content_filter") {
  return { content: "이 질문에는 답변드릴 수 없습니다." };
}
```

---

## 신고 메커니즘 (향후)

- 부적절한 AI 응답 신고 버튼
- 검토 후 프롬프트 개선

---

## 관련 문서

- [Prompt Injection](./prompt-injection.md)
- [Privacy](./privacy.md)
