-- Migration: Remove Space Feature
-- Description: Space 기능을 완전히 제거하고, 모든 데이터를 User 기준으로 관리하도록 변경

-- ===================================
-- Step 1: Plans 테이블에 icon, color 추가
-- ===================================
ALTER TABLE "plans" ADD COLUMN "icon" text DEFAULT 'target' NOT NULL;
ALTER TABLE "plans" ADD COLUMN "color" text DEFAULT 'blue' NOT NULL;

-- ===================================
-- Step 2: Plans 테이블에서 space_id 관련 제거
-- ===================================
-- FK 제거
ALTER TABLE "plans" DROP CONSTRAINT IF EXISTS "plans_space_id_spaces_id_fk";

-- 인덱스 제거
DROP INDEX IF EXISTS "plans_space_id_idx";
DROP INDEX IF EXISTS "plans_space_id_status_idx";
DROP INDEX IF EXISTS "plans_one_active_per_space_unique";

-- 새로운 인덱스 생성 (user 기준 active plan 제한)
CREATE UNIQUE INDEX "plans_one_active_per_user_unique" ON "plans" ("user_id") WHERE (status = 'ACTIVE'::plan_status);

-- space_id 컬럼 제거
ALTER TABLE "plans" DROP COLUMN "space_id";

-- ===================================
-- Step 3: Materials 테이블에서 space_id 관련 제거
-- ===================================
-- FK 제거
ALTER TABLE "materials" DROP CONSTRAINT IF EXISTS "materials_space_id_spaces_id_fk";

-- 인덱스 제거
DROP INDEX IF EXISTS "materials_space_id_created_at_idx";
DROP INDEX IF EXISTS "materials_processing_status_space_id_idx";
DROP INDEX IF EXISTS "materials_space_id_not_deleted_idx";

-- 새로운 인덱스 생성
CREATE INDEX "materials_user_id_idx" ON "materials" ("user_id");
CREATE INDEX "materials_user_id_created_at_idx" ON "materials" ("user_id", "created_at");
CREATE INDEX "materials_user_id_not_deleted_idx" ON "materials" ("user_id") WHERE (deleted_at IS NULL);

-- space_id 컬럼 제거
ALTER TABLE "materials" DROP COLUMN "space_id";

-- ===================================
-- Step 4: Plan Generation Requests 테이블에서 space_id 관련 제거
-- ===================================
ALTER TABLE "plan_generation_requests" DROP CONSTRAINT IF EXISTS "plan_generation_requests_space_id_spaces_id_fk";
DROP INDEX IF EXISTS "plan_generation_requests_space_id_idx";
ALTER TABLE "plan_generation_requests" DROP COLUMN "space_id";

-- ===================================
-- Step 5: Outline Nodes 테이블에서 space_id 관련 제거
-- ===================================
ALTER TABLE "outline_nodes" DROP CONSTRAINT IF EXISTS "outline_nodes_space_id_spaces_id_fk";
DROP INDEX IF EXISTS "outline_nodes_space_id_idx";
ALTER TABLE "outline_nodes" DROP COLUMN "space_id";

-- ===================================
-- Step 6: Session Runs 테이블에서 space_id 관련 제거
-- ===================================
ALTER TABLE "session_runs" DROP CONSTRAINT IF EXISTS "session_runs_space_id_spaces_id_fk";
ALTER TABLE "session_runs" DROP COLUMN "space_id";

-- ===================================
-- Step 7: Chat Threads 테이블에서 space_id 관련 제거
-- ===================================
ALTER TABLE "chat_threads" DROP CONSTRAINT IF EXISTS "chat_threads_space_id_spaces_id_fk";
DROP INDEX IF EXISTS "chat_threads_space_id_idx";
ALTER TABLE "chat_threads" DROP COLUMN "space_id";

-- ===================================
-- Step 8: Material Uploads 테이블에서 space_id 관련 제거
-- ===================================
ALTER TABLE "material_uploads" DROP CONSTRAINT IF EXISTS "material_uploads_space_id_spaces_id_fk";
-- 복합 인덱스 재생성 (space_id 제거)
DROP INDEX IF EXISTS "material_uploads_user_space_created_at_idx";
CREATE INDEX "material_uploads_user_id_created_at_idx" ON "material_uploads" ("user_id", "created_at");
ALTER TABLE "material_uploads" DROP COLUMN "space_id";

-- ===================================
-- Step 9: Domain Events 테이블에서 space_id 관련 제거
-- ===================================
DROP INDEX IF EXISTS "domain_events_space_id_idx";
ALTER TABLE "domain_events" DROP COLUMN "space_id";

-- ===================================
-- Step 10: Chat Scope Type enum에서 SPACE 제거
-- ===================================
-- chat_threads의 scope_type이 SPACE인 경우 처리 (PLAN으로 변경)
UPDATE "chat_threads" SET "scope_type" = 'PLAN' WHERE "scope_type" = 'SPACE';

-- ===================================
-- Step 11: Spaces 테이블 삭제
-- ===================================
DROP TABLE IF EXISTS "spaces";
