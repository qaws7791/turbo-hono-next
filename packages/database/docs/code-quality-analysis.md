# Database Package 코드 품질 분석 보고서

**분석 기준**: CLAUDE.md 가이드라인
**분석 일자**: 2025-11-17
**전체 평가**: C (중대한 네이밍 규칙 위반)

---

## 📊 요약

Database 패키지는 Drizzle ORM 구성과 마이그레이션 관리 측면에서 올바르게 구성되어 있습니다. 그러나 **모든 테이블 이름이 CLAUDE.md에 명시된 camelCase 대신 snake_case를 사용**하고 있어 즉각적인 수정이 필요합니다.

### 주요 지표

| 카테고리 | 현황 |
|----------|------|
| **테이블 네이밍** | ❌ snake_case 사용 (camelCase 필요) |
| **스키마 구성** | ✅ 올바르게 구성됨 |
| **마이그레이션 관리** | ✅ 자동 생성 사용 |
| **Drizzle 설정** | ✅ 패키지 레벨로 이동 완료 |
| **타입 Export** | ✅ 깔끔한 타입 export |

---

## 🔴 중대 이슈 (Critical)

### 1. 테이블 네이밍 규칙 위반

**파일**: `src/schema.ts`
**심각도**: CRITICAL
**가이드라인 위반**: "All table names follow camelCase convention"

#### 현재 구현 (위반)

모든 테이블이 snake_case를 사용하고 있습니다:

```typescript
// ❌ snake_case 사용
export const learning_plan = pgTable("learning_plan", {
  // ...
});

export const learning_module = pgTable("learning_module", {
  // ...
});

export const learning_task = pgTable("learning_task", {
  // ...
});

export const ai_note = pgTable("ai_note", {
  // ...
});

export const ai_quiz = pgTable("ai_quiz", {
  // ...
});

export const ai_quiz_result = pgTable("ai_quiz_result", {
  // ...
});

export const learning_plan_document = pgTable("learning_plan_document", {
  // ...
});

export const ai_conversation = pgTable("ai_conversation", {
  // ...
});

export const ai_message = pgTable("ai_message", {
  // ...
});
```

#### 위반 테이블 전체 목록

| 현재 이름 (snake_case) | 올바른 이름 (camelCase) | 라인 |
|------------------------|------------------------|------|
| `learning_plan` | `learningPlan` | 78 |
| `learning_module` | `learningModule` | 109 |
| `learning_task` | `learningTask` | 129 |
| `ai_note` | `aiNote` | 150 |
| `ai_note_job` | `aiNoteJob` | ? |
| `ai_quiz` | `aiQuiz` | 177 |
| `ai_quiz_job` | `aiQuizJob` | ? |
| `ai_quiz_result` | `aiQuizResult` | 204 |
| `learning_plan_document` | `learningPlanDocument` | 235 |
| `ai_conversation` | `aiConversation` | 276 |
| `ai_message` | `aiMessage` | 300 |
| `oauth_account` | `oauthAccount` | ? |
| (기타 모든 테이블) | (camelCase로 변환) | - |

#### 권장 해결책

```typescript
// ✅ camelCase 사용
export const learningPlan = pgTable("learningPlan", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  publicId: text("publicId").notNull().unique(),
  userId: text("userId").notNull().references(() => user.id, {
    onDelete: "cascade",
  }),
  title: text("title").notNull(),
  description: text("description"),
  userLevel: userLevel("userLevel").notNull(),
  learningStyle: learningStyle("learningStyle").notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const learningModule = pgTable("learningModule", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  learningPlanId: integer("learningPlanId")
    .notNull()
    .references(() => learningPlan.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  orderIndex: integer("orderIndex").notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const learningTask = pgTable("learningTask", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  learningModuleId: integer("learningModuleId")
    .notNull()
    .references(() => learningModule.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  status: taskStatus("status").notNull().default("todo"),
  dueDate: timestamp("dueDate", { mode: "date" }),
  orderIndex: integer("orderIndex").notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  completedAt: timestamp("completedAt", { mode: "date" }),
});

export const aiNote = pgTable("aiNote", {
  // ...
});

export const aiQuiz = pgTable("aiQuiz", {
  // ...
});

export const aiQuizResult = pgTable("aiQuizResult", {
  // ...
});

export const learningPlanDocument = pgTable("learningPlanDocument", {
  // ...
});

export const aiConversation = pgTable("aiConversation", {
  // ...
});

export const aiMessage = pgTable("aiMessage", {
  // ...
});

export const oauthAccount = pgTable("oauthAccount", {
  // ...
});
```

#### 마이그레이션 단계

이 변경은 데이터베이스 스키마를 변경하므로 신중하게 진행해야 합니다:

```bash
# 1. 스키마 파일 업데이트
# src/schema.ts에서 모든 테이블 이름을 camelCase로 변경

# 2. 마이그레이션 생성
pnpm --filter @repo/database db:generate

# 3. 생성된 마이그레이션 검토
# packages/database/migrations/에서 새 마이그레이션 파일 확인
# 테이블 이름 변경 SQL이 올바른지 검증

# 4. API 코드 업데이트
# apps/api/src/modules/*/repositories/ 파일들에서
# 테이블 import 이름 변경
# 예: import { learning_plan } from "@repo/database/schema";
# 변경: import { learningPlan } from "@repo/database/schema";

# 5. 마이그레이션 적용
pnpm --filter @repo/database db:push

# 6. 타입 체크
pnpm check-types
```

#### 영향 받는 파일들

API 코드에서 다음 위치들을 업데이트해야 합니다:

**apps/api/src/modules/learning-plan/repositories/**
- `learning-plan.repository.ts`
- `learning-module.repository.ts`
- `learning-task.repository.ts`

**apps/api/src/modules/documents/repositories/**
- `document.repository.ts` (if created)

**apps/api/src/modules/ai/repositories/**
- `ai-note.repository.ts` (if created)
- `ai-quiz.repository.ts` (if created)

**apps/api/src/modules/ai-chat/repositories/**
- `conversation.repository.ts`
- `message.repository.ts`

**apps/api/src/modules/auth/**
- `auth.service.ts` (직접 DB 접근하는 모든 곳)

**검색 방법**:
```bash
# 모든 snake_case 테이블 import 찾기
grep -r "learning_plan\|learning_module\|learning_task\|ai_note\|ai_quiz" apps/api/src/
```

---

## ✅ 긍정적인 발견사항

### 강점

1. **스키마 구성** ✅
   - 모든 스키마가 `src/schema.ts`에 체계적으로 구성
   - 관계(relations) 명확하게 정의
   - 적절한 외래 키 제약 조건 사용

2. **Drizzle 설정** ✅
   - `drizzle.config.ts`가 패키지 레벨에 올바르게 위치
   - 환경 변수 적절히 사용
   - 마이그레이션 폴더 구조 올바름

3. **마이그레이션 관리** ✅
   - 자동 생성된 마이그레이션만 존재
   - 수동 편집 흔적 없음
   - 버전 관리 적절

4. **타입 Export** ✅
   - `src/types.ts`에서 깔끔하게 타입 export
   - `src/index.ts`에서 통합 export
   - 타입 안전성 보장

5. **데이터베이스 클라이언트** ✅
   - Neon DB 클라이언트 적절히 설정
   - 연결 풀 관리
   - 환경별 설정 분리

---

## 📁 주요 테이블 구조

### 사용자 및 인증
- `user` - 사용자 기본 정보
- `session` - 세션 관리
- `oauthAccount` - OAuth 계정 연동

### 학습 엔터티
- `learningPlan` - 학습 계획
- `learningModule` - 학습 모듈
- `learningTask` - 학습 태스크

### AI 기능
- `aiNote` - AI 노트
- `aiNoteJob` - AI 노트 생성 작업
- `aiQuiz` - AI 퀴즈
- `aiQuizJob` - AI 퀴즈 생성 작업
- `aiQuizSubmission` - 퀴즈 제출 결과
- `aiChatHistory` - AI 채팅 히스토리

### 문서
- `document` - 문서 메타데이터
- `learningPlanDocument` - 학습 계획-문서 연결

---

## 🎯 즉시 실행 필요

### 우선순위 1: 테이블 네이밍 수정

이 작업은 **데이터베이스 마이그레이션을 포함**하므로 신중하게 진행해야 합니다:

1. **준비 단계**
   ```bash
   # 현재 데이터베이스 백업
   # Neon DB 콘솔에서 스냅샷 생성
   ```

2. **개발 환경에서 테스트**
   ```bash
   # 개발 DB에서 먼저 테스트
   # 1. schema.ts 업데이트
   # 2. 마이그레이션 생성
   # 3. API 코드 업데이트
   # 4. 마이그레이션 적용
   # 5. 테스트
   ```

3. **프로덕션 적용**
   ```bash
   # 프로덕션 배포 계획 수립
   # - 다운타임 최소화 전략
   # - 롤백 계획
   # - 모니터링 준비
   ```

---

## 📖 데이터베이스 작업 참고

### 마이그레이션 생성

```bash
# 스키마 변경 후 마이그레이션 생성
pnpm --filter @repo/database db:generate
```

### 마이그레이션 적용

```bash
# 개발 환경에 적용
pnpm --filter @repo/database db:push

# 프로덕션 환경 (신중하게)
# DATABASE_URL=<prod-url> pnpm --filter @repo/database db:push
```

### 데이터베이스 탐색

```bash
# Drizzle Studio 실행
pnpm --filter @repo/database db:studio
```

---

## 🚨 주의사항

### 테이블 이름 변경 시

1. **데이터 유실 위험**
   - 잘못된 마이그레이션은 데이터 유실을 초래할 수 있음
   - 반드시 백업 후 진행

2. **다운타임 발생 가능**
   - 프로덕션 적용 시 서비스 중단 가능
   - 점진적 마이그레이션 전략 고려

3. **코드 동기화**
   - API 코드를 동시에 업데이트하지 않으면 런타임 오류
   - 배포 순서 중요 (DB 마이그레이션 → API 배포)

---

**최종 업데이트**: 2025-11-17
**다음 리뷰**: 테이블 네이밍 수정 후
