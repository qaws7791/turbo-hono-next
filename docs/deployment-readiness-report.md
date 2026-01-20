# 배포 전 코드베이스 점검 보고서

**작성일:** 2026년 1월 20일
**대상:** Turbo Local Market 모노레포 (`api`, `web`)

## 1. Executive Summary

**배포 가능 여부:** 🟡 **Conditional Go** (조건부 승인)

전반적인 코드 구조와 환경변수 관리, 보안 설정은 양호하나, **자동화된 CI/CD 파이프라인 부재**와 **패키지 의존성 최적화**가 필요합니다. 아래의 Critical/High 리스크를 해소하거나 수동 배포 절차를 확립한 후 배포하는 것을 권장합니다.

**가장 치명적인 리스크 Top 3:**

1.  **CI/CD 파이프라인 부재 (High):** GitHub Workflows 등이 확인되지 않아, 빌드/테스트/배포 과정이 수동으로 이루어져야 하며 인적 오류 가능성이 높습니다.
2.  **API Rate Limiting의 한계 (Medium):** 인메모리 방식의 Rate Limit은 다중 인스턴스 확장 시 동작하지 않으며, 재시작 시 초기화됩니다.
3.  **불필요한 의존성 및 드라이버 혼선 (Low):** `apps/api`에 사용되지 않는 `pg` 드라이버가 포함되어 있으며, `neon-serverless`와의 역할 분담이 명확하지 않습니다.

---

## 2. Finding 목록 (우선순위 순)

### 1. CI/CD 파이프라인 부재

- **Severity:** High
- **Scope:** Repo / Infra
- **Symptom:** `.github/workflows` 디렉토리가 존재하지 않음.
- **Risk:** 테스트되지 않은 코드가 배포되거나, 배포 과정에서 빌드 아티팩트가 누락될 수 있음. 운영 환경의 일관성 보장 어려움.
- **Where to look:** `.github/workflows`
- **Recommendation:** 최소한 `build`, `lint`, `type-check`를 수행하는 CI 워크플로우와, Main 브랜치 병합 시 자동 배포하는 CD 파이프라인 구축.
- **Quick win:** `turbo run build lint check-types`를 수행하는 간단한 GitHub Action 추가.
- **Verification:** PR 생성 시 CI 통과 여부 확인.

### 2. API Rate Limiting 확장성 문제

- **Severity:** Medium
- **Scope:** API
- **Symptom:** `apps/api/src/middleware/rate-limit.ts` (추정)가 인메모리 저장소를 사용.
- **Risk:** API 서버가 여러 인스턴스로 스케일아웃되거나 재시작될 경우 제한 로직이 무력화됨.
- **Where to look:** `apps/api/src/app.ts`, `middleware/rate-limit.ts`
- **Recommendation:** Redis 또는 데이터베이스 기반의 Rate Limiter로 교체하거나, Cloudflare 등 앞단 인프라 레벨에서 제한 적용.
- **Quick win:** 단일 인스턴스 배포라면 현재 유지 가능하나, 인프라 레벨(Cloudflare/Nginx) 제한 병행 권장.
- **Verification:** 부하 테스트 도구로 임계치 초과 요청 시 차단 여부 확인.

### 3. 불필요한 의존성 (pg vs neon-serverless)

- **Severity:** Low
- **Scope:** API / Database
- **Symptom:** `apps/api/package.json`에 `pg`가 명시되어 있으나, 실제 DB 연결은 `@repo/database`의 `drizzle-orm/neon-serverless`를 사용함.
- **Risk:** 불필요한 패키지로 인한 번들 크기 증가 및 설치 시간 지연. 런타임 드라이버 혼선 가능성.
- **Where to look:** `apps/api/package.json`, `packages/database/src/client.ts`
- **Recommendation:** `apps/api`에서 `pg` 의존성 제거. `packages/database`가 올바른 클라이언트를 추상화하여 제공하고 있으므로 이를 신뢰.
- **Verification:** `pg` 제거 후 `pnpm build` 및 API 서버 기동 테스트.

### 4. Cloudflare Pages 배포 경로 확인

- **Severity:** Low
- **Scope:** Web
- **Symptom:** React Router v7의 빌드 출력 경로는 `build/client`이나, Cloudflare Pages 기본 설정 확인 필요.
- **Risk:** 배포 시 정적 파일을 찾지 못해 404 에러 발생.
- **Where to look:** `apps/web/package.json` (`build` 스크립트), Cloudflare Pages 설정.
- **Recommendation:** Cloudflare Pages의 Build output directory를 `apps/web/build/client`로 설정해야 함 (SPA 모드).
- **Verification:** 로컬에서 `pnpm build` 후 생성되는 디렉토리 구조 확인.

---

## 3. 배포 체크리스트 (최종)

### API 배포 체크리스트 (Node.js / Oracle Cloud)

- [ ] `apps/api/.env` 파일이 프로덕션 환경(오라클 클라우드)에 올바르게 설정되었는가? (특히 `DATABASE_URL`, `CORS_ORIGIN`)
- [ ] `pnpm build`가 에러 없이 완료되는가?
- [ ] `apps/api/package.json`의 `start` 스크립트(`node dist/index.js`)가 배포 환경에서 정상 작동하는가?
- [ ] 프로세스 관리자(PM2, Docker 등) 설정이 준비되었는가? (재시작 정책 등)

### Web 배포 체크리스트 (Cloudflare Pages)

- [ ] Cloudflare Pages 환경 변수에 `VITE_API_BASE_URL`이 프로덕션 API 주소로 설정되었는가?
- [ ] Build Command: `pnpm run build` (또는 `turbo run build --filter=web`)
- [ ] Build Output Directory: `apps/web/build/client`
- [ ] Node.js 버전 호환성 확인 (V 18 이상 권장)

### 공통 체크리스트

- [ ] `pnpm-lock.yaml`이 최신 상태이며 CI/배포 환경에서 `pnpm install --frozen-lockfile` 사용 가능한가?
- [ ] 프로덕션 DB(`packages/database`) 마이그레이션(`drizzle-kit migrate`)이 수행되었는가?

---

## 4. 추가 제언

- **보안:** `apps/api`의 `config.ts`에서 `COOKIE_SECURE`가 프로덕션(`NODE_ENV=production`)일 때 `true`로 강제되는 로직은 매우 훌륭합니다. 배포 환경이 HTTPS를 지원하는지 반드시 확인하세요.
- **모니터링:** `pino` 로거가 설정되어 있으나, 로그를 수집하고 조회할 수 있는 시스템(CloudWatch, Datadog, 또는 파일 저장 후 회전)이 오라클 클라우드 인스턴스에 구성되어야 합니다.
