# API 코드 품질 분석 보고서

**분석 기준**: CLAUDE.md 가이드라인
**분석 일자**: 2025-11-17
**전체 평가**: B+ (좋은 기반, 일관성 개선 필요)

---

## 📊 요약

API 백엔드는 에러 핸들링, API-First 개발, 타입 안정성 측면에서 강력한 기반을 가지고 있습니다. 그러나 **Repository 패턴과 Service Layer 가이드라인**이 일관되게 적용되지 않아 즉각적인 개선이 필요합니다.

### 주요 지표

| 카테고리 | 현황 | 개수 |
|----------|------|------|
| **모듈** | 전체 | 6 |
| **Repository** | 인터페이스 올바르게 구현 | 3 |
| **Repository** | 인터페이스 누락 | 2 |
| **Repository** | 완전 누락 | 4 |
| **Service** | 300줄 초과 | 4 |
| **Service** | 직접 DB 접근 | 6 |
| **Service** | CQRS 패턴 준수 | 1 (learning-plan) |
| **에러** | BaseError 확장 | 6/6 ✅ |
| **라우트** | c.req.valid() 사용 | 20/20 ✅ |
| **Console 구문** | 교체 필요 | ~15 |

---

## 🔴 중대 이슈 (Critical)

### 1. Service 파일 라인 수 제한 초과

**파일**: `src/modules/learning-plan/services/learning-task.command.service.ts`
**현재 라인 수**: 623줄 (300줄 제한의 207%)
**가이드라인 위반**: "Keep services focused and under 300 lines"

#### 권장 해결책

여러 개의 집중된 서비스로 분리:

```
learning-task.command.service.ts (623줄)
├── learning-task-creation.service.ts      # 생성 작업
├── learning-task-update.service.ts        # 업데이트 작업
├── learning-task-move.service.ts          # 이동/재정렬 작업
└── learning-task-bulk.service.ts          # 대량 작업
```

---

### 2. Service에서 직접 데이터베이스 접근

Repository 패턴을 사용하지 않고 Service에서 직접 `db` 객체를 import하여 쿼리를 실행하는 위반 사례가 다수 발견되었습니다.

#### 2.1 Learning Plan Query Service

**파일**: `src/modules/learning-plan/services/learning-plan.query.service.ts`
**라인**: 141-157

**현재 코드** (위반):
```typescript
// ❌ 직접 DB 접근
const documents = await db
  .select()
  .from(learningPlanDocument)
  .where(eq(learningPlanDocument.learningPlanId, planWithRelations.id))
```

**권장 수정**:
```typescript
// ✅ Repository 패턴 사용
class DocumentRepository {
  async findByLearningPlanId(
    learningPlanId: number,
    tx?: DatabaseTransaction
  ): Promise<Array<LearningPlanDocument>> {
    const client = tx ?? db;
    return client
      .select()
      .from(learningPlanDocument)
      .where(eq(learningPlanDocument.learningPlanId, learningPlanId));
  }
}
```

#### 2.2 Auth Service

**파일**: `src/modules/auth/services/auth.service.ts`
**라인**: 75-79, 95-129, 181-197, 274-278, 303-309

**문제**: 전체 서비스에서 user, account 테이블에 직접 접근

**권장 해결책**: `UserRepository`와 `AccountRepository` 생성

```typescript
// src/modules/auth/repositories/user.repository.ts
export class UserRepository implements BaseRepository<User, NewUser, Partial<User>> {
  async findByEmail(email: string, tx?: DatabaseTransaction): Promise<User | null> {
    // 구현
  }

  async createUserWithAccount(
    userData: NewUser,
    accountData: NewAccount,
    tx?: DatabaseTransaction
  ): Promise<User> {
    // 트랜잭션 내에서 User와 Account 생성
  }
}
```

#### 2.3 Progress Service

**파일**: `src/modules/progress/services/progress.service.ts`
**라인**: 168-242

**문제**: 복잡한 통계 쿼리를 서비스 레이어에 직접 작성

**권장 해결책**: `ProgressRepository` 생성

```typescript
export class ProgressRepository {
  async findCompletedTasksInRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<CompletedTask[]> {
    // 구현
  }

  async findDueTasksInRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<DueTask[]> {
    // 구현
  }
}
```

#### 2.4 Document Service

**파일**: `src/modules/documents/services/document.service.ts`
**라인**: 58-68, 120-124, 180-184, 195-198

**권장 해결책**: `DocumentRepository` 생성 및 `PublicIdRepository` 인터페이스 구현

#### 2.5 AI Services

**파일들**:
- `src/modules/ai/services/learning-plan-service.ts` (80-236줄)
- `src/modules/ai/services/learning-task-note-service.ts`
- `src/modules/ai/services/learning-task-quiz-service.ts`

**문제**: AI 관련 테이블(aiNote, aiQuiz 등)에 직접 접근

**권장 해결책**: AI 전용 Repository 생성

---

## 🟠 높은 우선순위 이슈 (High)

### 3. 300줄 가이드라인 초과 Service 파일들

| 파일 | 라인 수 | 초과율 |
|------|---------|--------|
| `learning-module.command.service.ts` | 334 | 11% |
| `learning-plan.query.service.ts` | 324 | 8% |
| `learning-plan.command.service.ts` | 320 | 7% |

**권장 해결책**:
1. Helper 메서드를 별도 유틸리티 파일로 추출
2. 복잡한 포맷팅 로직을 Formatter 클래스로 분리
3. 복잡한 작업을 더 작고 집중된 메서드로 분할

---

### 4. Repository 패턴 미구현 모듈

다음 모듈들은 Repository가 전혀 없이 Service에서 직접 DB 접근:

- `auth` - User/Account 직접 처리
- `documents` - Document CRUD 직접 처리
- `progress` - Progress 쿼리 직접 처리
- `ai` - AI Note/Quiz 테이블 직접 처리

**영향**: Clean Architecture 위반, 테스트 어려움, 높은 결합도

**권장 해결책**: `learning-plan` 모듈의 Repository 구현을 참고하여 각 모듈에 Repository 클래스 생성

---

### 5. AI Chat Repository 인터페이스 미구현

**파일**:
- `src/modules/ai-chat/repositories/conversation.repository.ts`
- `src/modules/ai-chat/repositories/message.repository.ts`

**문제**: Repository는 존재하지만 `BaseRepository` 인터페이스를 구현하지 않음

**권장 수정**:

```typescript
// conversation.repository.ts
export class ConversationRepository implements
  BaseRepository<AIConversation, NewAIConversation, Partial<AIConversation>> {

  // 추가 필요: update() 메서드
  async update(
    id: string,
    data: Partial<AIConversation>,
    tx?: DatabaseTransaction
  ): Promise<AIConversation> {
    // 구현
  }

  // 기존 메서드들은 이미 인터페이스와 일치: create(), findById(), delete()
}

// message.repository.ts
export class MessageRepository implements
  BaseRepository<AIMessage, NewAIMessage, Partial<AIMessage>> {

  // 추가 필요: update() 메서드
  // findById()는 이미 존재
}
```

---

## 🟡 중간 우선순위 이슈 (Medium)

### 6. console.log 사용 대신 Logger 사용 필요

**위치**:
- `src/modules/ai/services/learning-plan-service.ts` (233줄)
- 여러 route 파일들에서 디버깅용 console.error 사용

**가이드라인 위반**: 구조화된 로깅 우회

**권장 수정**:

```typescript
// ❌ 이전
console.error("Database save error:", error);

// ✅ 수정
import { log } from "@/lib/logger";
log.error("Database save error", { error });
```

---

### 7. CQRS 패턴 미적용 모듈

**모듈**: `auth`, `documents`, `progress`, `ai`

**문제**: Service가 Command/Query 패턴으로 분리되지 않음 (learning-plan과 달리)

**권장 해결책**:
- `auth.service.ts` → `auth-command.service.ts` + `auth-query.service.ts`
- `document.service.ts` → `document-command.service.ts` + `document-query.service.ts`
- `progress.service.ts` → `progress-query.service.ts` (쿼리만 있으므로 이름 변경)

---

## ✅ 긍정적인 발견사항

### 강점

1. **에러 핸들링** ✅
   - 모든 모듈 에러가 올바르게 `BaseError` 확장
   - 일관된 에러 팩토리 패턴
   - 적절한 HTTP 상태 코드 사용

2. **API-First 개발** ✅
   - 모든 라우트가 `@repo/api-spec`에서 import
   - Schema 파일들은 재export (중복 없음)
   - 모든 라우트에서 `c.req.valid()` 사용 (24건 발견)

3. **타입 안정성** ✅
   - 모듈에서 `any` 타입 미발견
   - TypeScript strict mode 준수
   - 명시적 반환 타입 사용

4. **트랜잭션 사용** ✅
   - Command Service에서 `runInTransaction()` helper 적절히 사용
   - Repository 메서드에서 트랜잭션 지원

5. **Repository 패턴 (부분적)** ✅
   - Learning-plan 모듈의 우수한 Repository 구현
   - 인터페이스 준수 (`PublicIdRepository`, `UserScopedRepository`)
   - N+1 쿼리 최적화 (루프 대신 JOIN 쿼리)

6. **네이밍 컨벤션** ✅
   - 파일은 kebab-case 사용
   - 타입은 PascalCase에 `T` prefix 사용
   - 일관된 서비스 네이밍 패턴

---

## 🎯 우선순위별 권장사항

### 즉시 실행 (1주차)
1. ✅ `learning-task.command.service.ts` 분할 (623줄 → 여러 집중된 서비스)
2. ✅ `auth`, `documents`, `progress`, `ai` 모듈용 Repository 생성
3. ✅ 모든 console.log/error를 구조화된 logger로 교체

### 단기 (2-3주차)
4. ✅ 300줄 초과 서비스 리팩토링
5. ✅ AI Chat Repository에 base 인터페이스 구현
6. ✅ Service에서 Repository로 모든 직접 DB 쿼리 이동

### 중기 (1개월)
7. ✅ 남은 모듈에 CQRS 패턴 적용
8. ✅ 모든 새 Repository에 대한 단위 테스트 추가
9. ✅ 프로젝트 위키에 Repository 패턴 문서화

---

## 📁 파일별 상세 이슈 목록

### Service Layer 위반

| 파일 | 라인 | 이슈 | 심각도 |
|------|------|------|--------|
| `learning-task.command.service.ts` | 전체 | 623줄 (300줄 제한 초과) | Critical |
| `learning-plan.query.service.ts` | 141-157 | 직접 DB 접근 (documents) | High |
| `learning-plan.query.service.ts` | 전체 | 324줄 (8% 초과) | High |
| `learning-plan.command.service.ts` | 전체 | 320줄 (7% 초과) | High |
| `learning-module.command.service.ts` | 전체 | 334줄 (11% 초과) | High |
| `auth.service.ts` | 75-79, 95-129, 181-197, 274-278, 303-309 | 직접 DB 접근 | High |
| `document.service.ts` | 58-68, 120-124, 180-184, 195-198 | 직접 DB 접근 | High |
| `progress.service.ts` | 168-242 | 직접 DB 접근 (복잡한 쿼리) | High |
| `ai/learning-plan-service.ts` | 80-236 | 직접 DB 접근 (트랜잭션) | High |
| `ai/learning-task-note-service.ts` | 다수 | 직접 DB 접근 | High |
| `ai/learning-task-quiz-service.ts` | 다수 | 직접 DB 접근 | High |

### Repository 패턴 위반

| 모듈 | 현황 | 필요 작업 |
|------|------|-----------|
| `learning-plan` | ✅ 완전 구현 | - |
| `ai-chat` | ⚠️ 부분 구현 | BaseRepository 인터페이스 추가 |
| `auth` | ❌ 없음 | UserRepository, AccountRepository 생성 |
| `documents` | ❌ 없음 | DocumentRepository 생성 |
| `progress` | ❌ 없음 | ProgressRepository 생성 |
| `ai` | ❌ 없음 | AINoteRepository, AIQuizRepository 생성 |

### Logging 이슈

| 파일 | 라인 | 구문 | 수정 |
|------|------|------|------|
| `ai/learning-plan-service.ts` | 233 | `console.log` | `log.info` |
| 여러 route 파일들 | 다수 | `console.error` | `log.error` |

---

## 📚 참고 구현 예시

### 우수 사례: Learning Plan Module

`learning-plan` 모듈은 다른 모듈이 따라야 할 우수한 참고 구현입니다:

✅ **Repository 패턴**
- `LearningPlanRepository` - `PublicIdRepository` 구현
- `LearningModuleRepository` - `BaseRepository` 구현
- `LearningTaskRepository` - `BaseRepository` 구현
- 모두 트랜잭션 지원 포함

✅ **CQRS 패턴**
- `learning-plan.command.service.ts` - Write 작업
- `learning-plan.query.service.ts` - Read 작업

✅ **N+1 쿼리 최적화**
- JOIN을 사용하여 관련 데이터를 한 번에 가져옴
- 루프 대신 배치 쿼리 사용

---

## 🔄 마이그레이션 전략

### 단계 1: Repository 생성 (우선순위 높음)

```typescript
// 1. Base repository interface 구현
// src/modules/auth/repositories/user.repository.ts

import { BaseRepository } from "@/lib/repository/base.repository";
import { db, DatabaseTransaction } from "@/database";
import { user, NewUser, User } from "@/database/schema";

export class UserRepository implements BaseRepository<User, NewUser, Partial<User>> {
  async create(data: NewUser, tx?: DatabaseTransaction): Promise<User> {
    const client = tx ?? db;
    const [created] = await client.insert(user).values(data).returning();
    return created;
  }

  async findById(id: string, tx?: DatabaseTransaction): Promise<User | null> {
    const client = tx ?? db;
    const [found] = await client.select().from(user).where(eq(user.id, id));
    return found ?? null;
  }

  async update(
    id: string,
    data: Partial<User>,
    tx?: DatabaseTransaction
  ): Promise<User> {
    const client = tx ?? db;
    const [updated] = await client
      .update(user)
      .set(data)
      .where(eq(user.id, id))
      .returning();
    return updated;
  }

  async delete(id: string, tx?: DatabaseTransaction): Promise<void> {
    const client = tx ?? db;
    await client.delete(user).where(eq(user.id, id));
  }

  // Domain-specific methods
  async findByEmail(email: string, tx?: DatabaseTransaction): Promise<User | null> {
    const client = tx ?? db;
    const [found] = await client.select().from(user).where(eq(user.email, email));
    return found ?? null;
  }
}
```

### 단계 2: Service 리팩토링

```typescript
// src/modules/auth/services/auth-command.service.ts

export class AuthCommandService {
  constructor(
    private userRepository: UserRepository,
    private accountRepository: AccountRepository
  ) {}

  async registerUser(email: string, password: string): Promise<User> {
    return runInTransaction(async (tx) => {
      const hashedPassword = await hashPassword(password);
      const newUser = await this.userRepository.create({ email }, tx);
      await this.accountRepository.create({
        userId: newUser.id,
        hashedPassword,
      }, tx);
      return newUser;
    });
  }
}
```

---

## 📖 추가 읽기 자료

- [Repository Pattern 베스트 프랙티스](../../../docs/patterns/repository-pattern.md)
- [CQRS in Node.js](../../../docs/patterns/cqrs-pattern.md)
- [Service Layer Guidelines](../../../docs/architecture/service-layer.md)

---

**최종 업데이트**: 2025-11-17
**다음 리뷰**: 리팩토링 완료 후
