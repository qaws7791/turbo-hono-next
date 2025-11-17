# 코드 품질 개선 작업 목록

> CLAUDE.md 가이드라인 기준 분석 결과 (2025-11-17)
>
> **범위**: 빠르게 해결 가능한 작은 개선 작업만 포함
>
> **제외**: 대규모 리팩토링, 아키텍처 변경, 다중 파일 동시 수정 작업

---

## 📊 요약

- **총 개선 항목**: 30개
- **High Priority**: 14개 (디버깅 코드 제거, Backend logger 교체)
- **Medium Priority**: 16개 (Frontend 에러 핸들링, Service logger 교체)

---

## 🔥 High Priority - Backend Route 핸들러 Logger 교체

> **문제**: CLAUDE.md에 따라 Pino logger를 사용해야 하나, 여전히 `console.error` 사용 중
>
> **해결**: 모든 `console.error()`를 `log.error()`로 교체

### Route 핸들러 (14개)

- [ ] **apps/api/src/modules/progress/routes/daily.ts:38**
  - 변경: `console.error("Daily learning module activity aggregation error:", error);`
  - 대체: `log.error({ error }, "Daily learning module activity aggregation error");`

- [ ] **apps/api/src/modules/auth/routes/logout.ts:33**
  - 변경: `console.error("Logout error:", error);`
  - 대체: `log.error({ error }, "Logout error");`

- [ ] **apps/api/src/modules/auth/routes/login-with-email.ts:43**
  - 변경: `console.error("Login error:", error);`
  - 대체: `log.error({ error }, "Login error");`

- [ ] **apps/api/src/modules/auth/routes/change-password.ts:46**
  - 변경: `console.error("Change password error:", error);`
  - 대체: `log.error({ error }, "Change password error");`

- [ ] **apps/api/src/modules/auth/routes/signup.ts:42**
  - 변경: `console.error("Signup error:", error);`
  - 대체: `log.error({ error }, "Signup error");`

- [ ] **apps/api/src/modules/documents/routes/detail.ts:43**
  - 변경: `console.error("Document detail error:", error);`
  - 대체: `log.error({ error }, "Document detail error");`

- [ ] **apps/api/src/modules/documents/routes/upload.ts:65**
  - 변경: `console.error("R2 upload failed:", error);`
  - 대체: `log.error({ error }, "R2 upload failed");`

- [ ] **apps/api/src/modules/documents/routes/upload.ts:95**
  - 변경: `console.error("Document upload error:", error);`
  - 대체: `log.error({ error }, "Document upload error");`

- [ ] **apps/api/src/modules/ai/routes/suggest-defaults.ts:107**
  - 변경: `console.error("AI plan recommendations error:", error);`
  - 대체: `log.error({ error }, "AI plan recommendations error");`

- [ ] **apps/api/src/modules/ai/routes/generate.ts:207**
  - 변경: `console.error("AI learningPlan generation error:", error);`
  - 대체: `log.error({ error }, "AI learningPlan generation error");`

- [ ] **apps/api/src/modules/ai/routes/generate-learning-task-quiz.ts:56**
  - 변경: `console.error("AI learning-task quiz generation error:", error);`
  - 대체: `log.error({ error }, "AI learning-task quiz generation error");`

- [ ] **apps/api/src/modules/ai/routes/generate-learning-task-note.ts:63**
  - 변경: `console.error("AI learning-task note generation error:", error);`
  - 대체: `log.error({ error }, "AI learning-task note generation error");`

- [ ] **apps/api/src/modules/learning-plan/routes/learning-tasks/submit-learning-task-quiz.ts:72**
  - 변경: `console.error("Submit learning-task quiz error:", error);`
  - 대체: `log.error({ error }, "Submit learning-task quiz error");`

- [ ] **apps/api/src/modules/ai/routes/generate.ts:79-82**
  - 제거: `console.log("Generated learningPlan:", JSON.stringify(...));` (디버깅용)
  - 또는 대체: `log.debug({ learningPlan }, "Generated learningPlan");` (개발 환경만)

---

## ⚠️ Medium Priority - Service Layer Logger 교체

> **문제**: Service 파일에서도 `console.warn/error` 사용 중
>
> **해결**: Pino logger로 교체

### Service 파일 (6개)

- [ ] **apps/api/src/modules/ai/services/learning-task-note-service.ts:447**
  - 변경: `console.warn(...)`
  - 대체: `log.warn({ ... }, "Warning message");`

- [ ] **apps/api/src/modules/ai/services/learning-task-note-service.ts:461**
  - 변경: `console.error("Document fetch error during AI note generation:", error);`
  - 대체: `log.error({ error }, "Document fetch error during AI note generation");`

- [ ] **apps/api/src/modules/ai/services/learning-task-note-service.ts:577**
  - 변경: `console.error("Learning-task AI note generation failed:", error);`
  - 대체: `log.error({ error }, "Learning-task AI note generation failed");`

- [ ] **apps/api/src/modules/ai/services/learning-plan-service.ts:233**
  - 변경: `console.error("Database save error:", error);`
  - 대체: `log.error({ error }, "Database save error");`

- [ ] **apps/api/src/modules/ai/services/learning-task-quiz-service.ts:185**
  - 변경: `console.warn("Failed to parse stored quiz questions:", parsed.error);`
  - 대체: `log.warn({ error: parsed.error }, "Failed to parse stored quiz questions");`

- [ ] **apps/api/src/modules/ai/services/learning-task-quiz-service.ts:864**
  - 변경: `console.error("Learning-task quiz generation failed:", error);`
  - 대체: `log.error({ error }, "Learning-task quiz generation failed");`

---

## 🎨 Medium Priority - Frontend 디버깅 코드 및 에러 핸들링

> **문제**: 프로덕션 환경에 남아있는 `console.log` 디버깅 코드와 부적절한 에러 핸들링
>
> **해결**: 디버깅 코드 완전 제거, 에러는 사용자 친화적으로 처리

### 디버깅 코드 완전 제거 (3개)

- [ ] **apps/web/src/features/ai-chat/hooks/use-ai-chat.ts:25**
  - 제거: `console.log("useAIChat conversationId:", conversationId);`

- [ ] **apps/web/src/features/ai-chat/components/chatbot.tsx:45**
  - 제거: `console.log("onFinish");`

- [ ] **apps/web/src/features/learning-plan/components/learning-plan-funnel/steps/pdf-input-step.tsx:55**
  - 제거: `console.log("handleDelete", _documentId);`

### 에러 핸들링 개선 (7개)

- [ ] **apps/web/src/features/ai-chat/hooks/use-ai-chat.ts:51**
  - 변경: `console.error("AI 채팅 에러:", error);`
  - 개선: Toast 알림 또는 에러 상태 반환으로 사용자에게 피드백 제공

- [ ] **apps/web/src/features/ai-chat/components/chatbot.tsx:48**
  - 변경: `console.error("AI 채팅 에러:", error);`
  - 개선: 에러 메시지를 UI에 표시 (예: "채팅 메시지 전송에 실패했습니다")

- [ ] **apps/web/src/features/ai-chat/components/ai-chat-section.tsx:46**
  - 변경: `console.error("대화 생성 실패:", error);`
  - 개선: Toast 알림으로 사용자에게 "새 대화 생성에 실패했습니다" 안내

- [ ] **apps/web/src/features/ai-chat/components/ai-chat-section.tsx:60**
  - 변경: `console.error("대화 삭제 실패:", error);`
  - 개선: Toast 알림으로 사용자에게 "대화 삭제에 실패했습니다" 안내

- [ ] **apps/web/src/features/learning-plan/components/learning-plan-funnel/steps/pdf-input-step.tsx:50**
  - 변경: `console.error("Upload failed:", err);`
  - 개선: 이미 `setError`로 상태 관리 중이므로 console.error만 제거

- [ ] **apps/web/src/features/learning-plan/components/learning-plan-funnel/index.tsx:41**
  - 변경: `console.error("학습 계획 생성 실패:", err);`
  - 개선: Toast 알림으로 사용자에게 "학습 계획 생성에 실패했습니다" 안내

- [ ] **apps/web/src/features/learning-plan/components/learning-plan-funnel/steps/ai-recommendations-step.tsx:131**
  - 변경: `console.error("AI recommendations failed:", err);`
  - 개선: Toast 알림으로 사용자에게 "AI 추천을 불러오는데 실패했습니다" 안내

---

## ✅ 잘 지켜지고 있는 규칙

### TypeScript 규칙
- ✅ `any` 타입 사용 거의 없음
- ✅ Type parameters `T` prefix 규칙 준수 (`TUser`, `TEntity`, `TInsert` 등)
- ✅ strict mode 활성화

### 네이밍 규칙
- ✅ Hooks: `use` prefix 잘 지켜짐
- ✅ Files: kebab-case, PascalCase 규칙 준수
- ✅ camelCase 규칙 잘 지켜짐

### 포맷팅
- ✅ 80-char line length 대부분 준수
- ✅ 2-space indent, trailing commas 규칙 준수

---

## 📌 참고 사항 (대규모 리팩토링 - 이 문서 범위 외)

다음 항목들은 발견되었으나 **빠른 개선 작업이 아니므로** 별도 계획 필요:

### 서비스 파일 크기 초과 (CLAUDE.md: 300 lines 이하 권장)
- `learning-task-quiz-service.ts`: 1122 lines ⚠️ 심각
- `create-tools.ts`: 687 lines
- `learning-task.command.service.ts`: 623 lines
- `learning-task-note-service.ts`: 623 lines
- `learning-plan.repository.ts`: 516 lines
- 기타 300-350 lines: 6개 파일

### Repository Pattern 미준수
- 8개의 서비스 파일이 직접 `db` import하여 사용
- 권장: Repository 레이어를 통한 DB 접근

---

## 🚀 작업 진행 방법

1. **High Priority** 항목부터 순차적으로 처리
2. 각 파일 수정 후 `pnpm check-types` 실행하여 타입 에러 확인
3. 수정 완료 후 `pnpm lint` 실행
4. 체크박스를 체크하여 진행 상황 관리
5. 전체 완료 후 커밋 (Conventional Commits 규칙 준수)

```bash
# 권장 커밋 메시지
git commit -m "refactor: replace console logging with Pino logger"
git commit -m "fix: remove debugging console.log statements"
git commit -m "fix: improve error handling with user-friendly messages"
```

---

**작성일**: 2025-11-17
**분석 대상**: apps/api, apps/web, packages/database, packages/api-spec
**기준 문서**: CLAUDE.md
