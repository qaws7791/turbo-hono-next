아래는 현재 레포 문서 구조(01~04) 기준에서, **04(Engineering)에서 추가로 필요해 보이는 문서들을 “전부”** 정리한 목록입니다. 경로는 **레포 루트 기준 상대 경로**입니다.

---

## 04-engineering 공통(의사결정/운영 기준)

- **`04-engineering/overview.md`**
  04 문서들의 범위/우선순위, MVP 스코프(동기/비동기 전환 기준 포함), “결정해야 하는 것” 체크리스트를 요약.

- **`04-engineering/decision-log.md`**
  핵심 기술 의사결정 기록(예: Plan 스냅샷 방식, RAG 스코프 규칙, 청크 정책, 세션 복구 방식 등)과 변경 이력.

- **`04-engineering/glossary-engineering.md`**
  엔지니어링 전용 용어(ingestion, chunk, citation, session-run, idempotency 등) 정의.

---

## 04-engineering/adr (Architecture Decision Record)

> “왜 이렇게 했는가”를 남겨, 미래에 변경/회귀를 줄이기 위한 문서입니다.

- **`04-engineering/adr/0001-repo-structure.md`**
  모노레포/디렉토리 규칙, 문서-코드 대응 원칙.

- **`04-engineering/adr/0002-plan-snapshot-contract.md`**
  Plan이 참조하는 문서 범위(스냅샷/직접참조), 불변성 정책, 삭제/GC와의 결합 규칙.

- **`04-engineering/adr/0003-session-run-model.md`**
  Session(스케줄)과 SessionRun(실행기록) 분리 이유, 상태 머신 요약, 복구 정책.

- **`04-engineering/adr/0004-rag-scope-and-citations.md`**
  검색 스코프 제한 규칙(Plan/전체), citation 저장 여부/포맷, 재현성 전략.

- **`04-engineering/adr/0005-ingestion-sync-to-async.md`**
  MVP 동기 처리에서 비동기 잡으로 전환하는 기준(문서 크기/시간/비용), 전환 시 API 계약 변화.

---

## 04-engineering/api (API 계약/스펙)

> README에 디렉토리만 존재하므로, 실제 엔드포인트 설계를 문서화해야 합니다.

- **`04-engineering/api/overview.md`**
  API 설계 원칙(버저닝, pagination, sorting, filtering), 공통 규약(응답 포맷/에러 포맷).

- **`04-engineering/api/auth.md`**
  인증 방식(매직링크/Google OAuth), 세션 쿠키 정책, CSRF/리다이렉트 allowlist 등 보안 계약.

- **`04-engineering/api/errors.md`**
  에러 코드 체계, 프론트에서의 처리 가이드(재시도/토스트/리다이렉트), Validation 오류 포맷.

- **`04-engineering/api/materials.md`**
  업로드/상태 조회/리스트/삭제, processing_status 전이, 대용량 처리 시 폴링/SSE 전략.

- **`04-engineering/api/plans.md`**
  Plan 생성(위저드 입력 포함), Active Plan 제약, 생성 상태 추적, 취소/재시도 규칙.

- **`04-engineering/api/sessions.md`**
  오늘 할 일 큐 조회, SessionRun 생성/재개/완료, 중간 저장, idempotency 키 정책.

- **`04-engineering/api/chat.md`**
  RAG 기반 대화 API, citation 포함 응답 스키마, thread/scope 규칙.

- **`04-engineering/api/openapi-generation.md`**
  zod-openapi로 스펙 생성/배포(문서 URL, CI에서 검증) 방법.

---

## 04-engineering/backend (서버 구현 상세 설계)

- **`04-engineering/backend/module-boundaries.md`**
  Route/Service/AI Layer 분리 규칙, 트랜잭션 경계, 공통 미들웨어(레이트리밋/에러핸들링).

- **`04-engineering/backend/ingestion-pipeline.md`**
  parse→chunk→embed 단계별 상세(청크 기준, 메타데이터, 실패/재시도, 부분 성공 처리).

- **`04-engineering/backend/rag-retrieval.md`**
  리트리벌 전략(필터링, Top-K, 하이브리드 여부), 재랭킹 도입 시점, 근거 일탈 방지 규칙.

- **`04-engineering/backend/prompt-and-templates.md`**
  프롬프트 템플릿 버전 관리, 시스템 프롬프트/툴 프롬프트 구성, 변경 시 회귀 방지 전략.

- **`04-engineering/backend/plan-generation.md`**
  커리큘럼 생성 파이프라인(입력 스키마, 결과 스키마, 생성 실패/재시도/부분 저장).

- **`04-engineering/backend/session-engine.md`**
  세션 진행 상태 머신(스텝 전이, 체크인/활동 기록), 중간 저장/복구, 동시성/중복 호출 방지.

- **`04-engineering/backend/personalization-engine.md`**
  세션 개인화, 난이도 적응 로직.

- **`04-engineering/backend/background-jobs.md`**
  비동기 전환 시 잡 모델(status/progress), 큐/워커 구성, 재시도/데드레터 정책.

- **`04-engineering/backend/rate-limit-and-quotas.md`**
  사용자 단위 레이트리밋, 비용 폭주 방지(토큰 예산, 호출 제한), 캐싱 정책.

- **`04-engineering/backend/observability.md`**
  로그 상관관계 ID, 핵심 메트릭(OpenAI 호출/지연/실패율, retrieval hit rate), Sentry/Posthog 연동 기준.

- **`04-engineering/backend/migrations-and-seeding.md`**
  Drizzle 마이그레이션 규칙, 시드 데이터(샘플 학습 자료 및 계획 등), 환경별 데이터 전략.

---

## 04-engineering/frontend (프론트 구현 상세 설계)

- **`04-engineering/frontend/app-architecture.md`**
  라우팅 구조(React Router v7), 페이지/컴포넌트 경계, 공통 UI 레이아웃 규칙.

- **`04-engineering/frontend/server-state.md`**
  TanStack Query 사용 범위, 캐시 키 규칙, optimistic update, 에러/재시도 UX.

- **`04-engineering/frontend/session-mode-state.md`**
  풀스크린 세션 모드의 상태 모델(스텝, 입력, 타이머, 중단/재개), 렌더 성능 기준.

- **`04-engineering/frontend/offline-and-recovery.md`**
  로컬 스토리지 스냅샷, 네트워크 불안정 시 동작, 충돌 해결(로컬 vs 서버) 규칙.

- **`04-engineering/frontend/security.md`**
  XSS/CSRF 방어, 파일 업로드 사전검증, 권한 오류 처리(401/403 UX).

- **`04-engineering/frontend/telemetry.md`**
  사용자 행동 이벤트 설계(세션 시작/완료/이탈), 성능 지표, 개인정보 최소수집 원칙.

---

## 04-engineering/policies (운영/보안/데이터 정책)

> 현재 `material-deletion.md`만 있으므로, 아래 정책들이 빠지면 운영 시 충돌이 생깁니다.

- **`04-engineering/policies/access-control.md`**
  사용자 소유권 검증 규칙, 리소스별 권한 체크 표준.

- **`04-engineering/policies/data-retention.md`**
  raw file/chunk/embedding/chat log 보존 기간, 계정 삭제 시 파기 범위, 백업/복구 원칙.

- **`04-engineering/policies/privacy.md`**
  민감정보 가능성(업로드 문서) 대응, 로그 마스킹, PII 저장 금지/허용 기준.

- **`04-engineering/policies/content-safety.md`**
  사용자 입력/업로드 텍스트에 대한 안전 정책(금지/제한 범주), 모델 응답 필터링 원칙.

- **`04-engineering/policies/prompt-injection.md`**
  문서 기반 공격(prompt injection) 대응: 시스템 프롬프트 보호, 컨텍스트 주입 방지, citation 기반 답변 제한.

- **`04-engineering/policies/cost-governance.md`**
  토큰/호출 예산, 대형 문서 제한, 과금/쿼터(추후) 정책, abuse 방지.

---

## 루트(레포 최상단) 문서(개발/운영에 실질적으로 필요)

- **`ENVIRONMENT.md`**
  환경변수 목록(필수/선택), 로컬/스테이징/프로덕션 차이, 시크릿 관리.

- **`TESTING.md`**
  단위/통합/E2E 범위, AI 기능 평가(회귀 테스트) 방식, 테스트 데이터 규칙.

---

원하시면, 위 목록을 그대로 레포의 README “04. Engineering” 섹션에 반영할 수 있도록 **목차 형태로 재구성**해 드리겠습니다.
