# 🧰 Worker 배포 가이드 (Oracle Cloud + Docker + GitHub Actions)

이 문서는 `apps/worker`(BullMQ Worker)를 Oracle Cloud 인스턴스에 배포하는 방법을 설명합니다.

## ✅ 전제

- API 배포 가이드의 “Oracle 인스턴스 초기 설정”을 이미 완료했습니다. (`deploy/setup-instance.sh`)
- 같은 인스턴스에서 `lolog-api`와 `lolog-worker` 컨테이너를 함께 운영합니다.

## 🏗️ Docker 빌드 방식

`apps/api`와 동일하게 Turborepo `turbo prune --docker` 방식을 사용합니다.

- Dockerfile: [`apps/worker/Dockerfile`](../../../apps/worker/Dockerfile)
- 빌드 필터: `worker`

## 🔐 필요한 GitHub Secrets

### Oracle Cloud

- `ORACLE_SSH_PRIVATE_KEY`
- `ORACLE_HOST`
- `ORACLE_USER` (기본: `ubuntu`)
- `GHCR_PAT`, `GHCR_USERNAME` (인스턴스에서 GHCR 이미지 pull용)

### Application (Worker 런타임)

- `DATABASE_URL`
- `REDIS_URL`
- `QUEUE_CONCURRENCY` (선택, 기본 `2`)
- `WORKERS` (선택, 예: `material,plan` / 기본: 둘 다)

#### (선택) R2

- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_ENDPOINT`
- `R2_PUBLIC_URL`

#### (선택) AI

- `GEMINI_API_KEY`
- `GEMINI_CHAT_MODEL`
- `GEMINI_EMBEDDING_MODEL`

## 🚀 배포 방식

GitHub Actions 워크플로우:

- 파일: [`.github/workflows/deploy-worker.yml`](../../../.github/workflows/deploy-worker.yml)
- 트리거: `main` 푸시 + `apps/worker/**` 또는 worker가 의존하는 핵심 패키지 변경 시
- 결과: 인스턴스에서 `lolog-worker` 컨테이너를 재시작하며 새 이미지로 교체

## 📊 운영/로그

```bash
# 실행 상태
docker ps | grep lolog-worker

# 로그
docker logs -f lolog-worker

# 최근 200줄
docker logs --tail 200 lolog-worker
```
