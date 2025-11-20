# @repo/database

Drizzle ORM 데이터베이스 스키마 및 클라이언트 (Neon DB)

## Purpose

- PostgreSQL 스키마 정의 (Drizzle ORM)
- 타입 안전 DB 클라이언트 제공
- 마이그레이션 관리
- 공유 데이터베이스 타입

## Key Files

- `schema.ts`: 전체 DB 스키마 (Auth, Learning, AI, Documents)
- `client.ts`: DB 연결 클라이언트
- `types.ts`: 추론된 타입 exports
- `migrations/`: 생성된 마이그레이션 파일 (직접 수정 금지)

## Important Rules

1. **스키마 수정 후 반드시 마이그레이션 생성**: `pnpm db:generate`
2. **마이그레이션 파일 직접 수정 금지** - 항상 schema.ts 수정 후 재생성
3. **Foreign key에 onDelete 명시** - cascade, set null, restrict 등
4. **camelCase (TS) ↔ snake_case (DB)** - Drizzle이 자동 변환
5. **트랜잭션 필요시 tx 파라미터 전달**

## Commands

```bash
pnpm --filter @repo/database db:generate  # 마이그레이션 생성
pnpm --filter @repo/database db:push      # 스키마 적용 (dev)
pnpm --filter @repo/database db:studio    # GUI 열기
```

## Schema Modification Workflow

1. `schema.ts` 수정
2. `pnpm db:generate` - SQL 마이그레이션 생성
3. 생성된 SQL 검토
4. `pnpm db:push` 적용
5. 타입 체크: `pnpm check-types`

## Common Patterns

- **Timestamps**: `timestamp("created_at").$defaultFn(() => new Date())`
- **Foreign keys**: `.references(() => user.id, { onDelete: "cascade" })`
- **Indexes**: 두 번째 인자로 index 정의
- **JSON columns**: `jsonb("data").$type<MyType>()`

## Design Note

N+1 쿼리 주의 - leftJoin 사용 또는 별도 쿼리로 최적화
