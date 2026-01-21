# 🚀 API 배포 가이드 (Oracle Cloud + Docker + GitHub Actions)

이 문서는 `apps/api` Hono 서버를 Oracle Cloud 인스턴스에 배포하는 방법을 설명합니다.

## 📋 아키텍처 개요

```
┌─────────────────┐     Push      ┌──────────────────┐
│  GitHub Repo    │─────────────▶│  GitHub Actions  │
│  (main branch)  │               │  (Build & Push)  │
└─────────────────┘               └────────┬─────────┘
                                           │
                                           ▼
                                   ┌───────────────┐
                                   │     GHCR      │
                                   │  (ghcr.io)    │
                                   │  Docker Image │
                                   └───────┬───────┘
                                           │ SSH + GHCR_PAT
                                           ▼
                              ┌────────────────────────┐
                              │  Oracle Cloud Instance │
                              │  (ARM64 Ampere A1)     │
                              │  ┌──────────────────┐  │
                              │  │  Docker          │  │
                              │  │  └─ API (Hono)   │  │
                              │  │     :3000        │  │
                              │  ├──────────────────┤  │
                              │  │  Caddy           │  │
                              │  │  └─ HTTPS        │  │
                              │  │     :443 → :3000 │  │
                              │  └──────────────────┘  │
                              └────────────────────────┘
                                           │
                                           ▼
                              ┌────────────────────────┐
                              │   api.lolog.site       │
                              │   (HTTPS automatic)    │
                              └────────────────────────┘
```

## 🏗️ Docker 빌드 방식

Turborepo 공식 문서의 `turbo prune --docker` 방식을 사용합니다:

```
Stage 0: base
└─ Alpine + libc6-compat

Stage 1: prepare
├─ turbo 설치
├─ 전체 monorepo 복사
└─ turbo prune api --docker 실행
   ├─ out/json/      (package.json들만 - 의존성 설치용)
   ├─ out/full/      (전체 소스 - 빌드용)
   └─ out/pnpm-lock.yaml (pruned lockfile)

Stage 2: builder
├─ out/json/ 복사 (캐시 레이어)
├─ pnpm install --frozen-lockfile
├─ out/full/ 복사
└─ turbo build --filter=api

Stage 3: prod-deps
├─ out/json/ 복사
└─ pnpm install --prod

Stage 4: runner (최종 이미지)
├─ prod-deps에서 node_modules 복사
├─ builder에서 dist 복사
└─ node dist/index.mjs 실행
```

### 캐시 최적화 효과

| 시나리오                 | 결과                                    |
| ------------------------ | --------------------------------------- |
| `apps/web` 의존성 변경   | ✅ api 캐시 유지 (pruned lockfile 불변) |
| `apps/api` 소스만 변경   | ✅ `pnpm install` 캐시, 빌드만 재실행   |
| `packages/database` 변경 | ✅ 정상 감지 및 재빌드                  |

---

## 🔧 사전 준비 사항

### 1. Oracle Cloud 인스턴스 생성

- **Shape**: VM.Standard.A1.Flex (ARM64 Ampere A1)
- **OCPU**: 1-4 (무료 티어 최대 4 OCPU)
- **Memory**: 6-24GB (무료 티어 최대 24GB)
- **OS**: Ubuntu 22.04 (권장)
- **Boot Volume**: 50GB (무료 티어)

### 2. 네트워크 설정

Oracle Cloud Console에서 **Virtual Cloud Network > Security Lists**에 다음 Ingress 규칙 추가:

| Source CIDR | Protocol | Dest Port | Description |
| ----------- | -------- | --------- | ----------- |
| 0.0.0.0/0   | TCP      | 22        | SSH         |
| 0.0.0.0/0   | TCP      | 80        | HTTP        |
| 0.0.0.0/0   | TCP      | 443       | HTTPS       |

### 3. DNS 설정

도메인 DNS에서 A 레코드를 Oracle 인스턴스의 공인 IP로 설정:

```
api.lolog.site    A    <ORACLE_INSTANCE_PUBLIC_IP>
```

---

## 🛠️ Oracle 인스턴스 초기 설정

SSH로 인스턴스에 접속한 후, 다음 스크립트를 실행합니다:

```bash
# 1. 스크립트 다운로드 및 실행
curl -fsSL https://raw.githubusercontent.com/<YOUR_REPO>/main/deploy/setup-instance.sh | bash

# 또는 수동으로 실행
wget https://raw.githubusercontent.com/<YOUR_REPO>/main/deploy/setup-instance.sh
chmod +x setup-instance.sh
./setup-instance.sh
```

### 스크립트가 수행하는 작업:

1. 시스템 패키지 업데이트
2. Docker 설치 (ARM64용)
3. Caddy 설치 (자동 HTTPS)
4. 방화벽 규칙 설정 (80, 443 포트)
5. Caddyfile 구성

### 설정 완료 후 확인:

```bash
# Docker 그룹 적용을 위해 재로그인
exit
# SSH 재접속

# Docker 버전 확인
docker --version

# Caddy 상태 확인
sudo systemctl status caddy
```

---

## 🔐 GitHub Secrets 설정

GitHub 저장소 > **Settings** > **Secrets and variables** > **Actions**에서 다음 시크릿들을 추가:

### Oracle Cloud 접속 정보

| Secret Name              | Description             | Example                                  |
| ------------------------ | ----------------------- | ---------------------------------------- |
| `ORACLE_HOST`            | Oracle 인스턴스 공인 IP | `123.456.789.012`                        |
| `ORACLE_USER`            | SSH 사용자명            | `ubuntu`                                 |
| `ORACLE_SSH_PRIVATE_KEY` | SSH 개인키 (전체 내용)  | `-----BEGIN OPENSSH PRIVATE KEY-----...` |

### GHCR 접근 토큰 (⚠️ 필수!)

| Secret Name | Description                                         |
| ----------- | --------------------------------------------------- |
| `GHCR_PAT`  | GitHub Personal Access Token (`read:packages` 권한) |

> 선택: `GHCR_USERNAME` (PAT 소유자 계정명). PAT 소유자가 GitHub Actions 실행자(`github.actor`)와 다를 수 있어,
> 인스턴스에서 `docker login` 실패 시 추가하세요.

#### GHCR_PAT 생성 방법:

1. GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. **Generate new token (classic)** 클릭
3. 설정:
   - **Note**: `GHCR Read Access for Oracle`
   - **Expiration**: 적절히 설정 (예: 1년)
   - **Scopes**: ✅ `read:packages` 체크
4. 생성된 토큰을 `GHCR_PAT` 시크릿으로 저장

### 애플리케이션 환경 변수

| Secret Name             | Description                             |
| ----------------------- | --------------------------------------- |
| `DATABASE_URL`          | NeonDB 연결 문자열                      |
| `SERVICE_NAME`          | 서비스 이름 (예: `lolog-api`)           |
| `BASE_URL`              | API 기본 URL (`https://api.lolog.site`) |
| `FRONTEND_URL`          | 프론트엔드 URL (`https://lolog.site`)   |
| `SESSION_COOKIE_NAME`   | 세션 쿠키 이름                          |
| `SESSION_DURATION_DAYS` | 세션 유지 기간 (일)                     |
| `COOKIE_SECURE`         | 쿠키 Secure 플래그 (`true`)             |
| `GOOGLE_CLIENT_ID`      | Google OAuth 클라이언트 ID              |
| `GOOGLE_CLIENT_SECRET`  | Google OAuth 클라이언트 시크릿          |

| `EMAIL_DELIVERY_MODE` | 이메일 전송 모드 (`resend` \| `log`) |
| `RESEND_API_KEY` | Resend API 키 |
| `RESEND_EMAIL` | 발신 이메일 주소 |
| `R2_ACCESS_KEY_ID` | Cloudflare R2 액세스 키 |
| `R2_SECRET_ACCESS_KEY` | Cloudflare R2 시크릿 키 |
| `R2_BUCKET_NAME` | R2 버킷 이름 |
| `R2_ENDPOINT` | R2 엔드포인트 |
| `R2_PUBLIC_URL` | R2 공개 URL |
| `GEMINI_API_KEY` | Google Gemini API 키 |
| `GEMINI_CHAT_MODEL` | Gemini 채팅 모델 |
| `GEMINI_EMBEDDING_MODEL` | Gemini 임베딩 모델 |
| `OPENAI_API_KEY` | OpenAI API 키 |
| `OPENAI_SESSION_MODEL` | OpenAI 세션 모델 |

### (선택) Turbo Remote Cache

| Secret Name   | Description              |
| ------------- | ------------------------ |
| `TURBO_TOKEN` | Vercel Remote Cache 토큰 |
| `TURBO_TEAM`  | Vercel 팀 이름           |

---

## 🚀 배포 방법

### 자동 배포 (권장)

`main` 브랜치에 푸시하면 자동으로 배포됩니다:

```bash
git add .
git commit -m "feat: add new feature"
git push origin main
```

### 배포 트리거 조건

다음 경로 변경 시 자동 배포:

- `apps/api/**`
- `packages/database/**`
- `packages/api-spec/**`
- `packages/config/**`
- `pnpm-lock.yaml`
- `pnpm-workspace.yaml`
- `.github/workflows/deploy-api.yml`

### 수동 배포

GitHub Actions 탭에서 "Deploy API" 워크플로우를 **Run workflow** 버튼으로 수동 실행 가능.

---

## 📊 모니터링 및 로그

### API 로그 확인

```bash
# 실시간 로그
docker logs -f lolog-api

# 최근 100줄
docker logs --tail 100 lolog-api
```

### Caddy 로그 확인

```bash
sudo tail -f /var/log/caddy/api.lolog.site.log
```

### 컨테이너 상태 확인

```bash
docker ps
docker stats lolog-api
```

### Health Check

```bash
curl https://api.lolog.site/health
```

예상 응답:

```json
{
  "status": "ok",
  "timestamp": "2026-01-22T00:00:00.000Z",
  "service": "lolog-api"
}
```

---

## 🔄 롤백 방법

이전 버전으로 롤백하려면:

```bash
# 1. 현재 컨테이너 중지
docker stop lolog-api
docker rm lolog-api

# 2. 이전 이미지 확인 (SHA 태그 목록)
docker images ghcr.io/<YOUR_REPO>/api

# 3. 특정 버전으로 실행
docker run -d \
  --name lolog-api \
  --restart unless-stopped \
  -p 127.0.0.1:3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  # ... 기타 환경 변수 ...
  ghcr.io/<YOUR_REPO>/api:<PREVIOUS_SHA>
```

---

## 🛡️ 보안 체크리스트

- [ ] SSH 키 인증만 허용 (비밀번호 인증 비활성화)
- [ ] 방화벽에서 필요한 포트만 개방 (22, 80, 443)
- [ ] GitHub Secrets에 민감한 정보 저장
- [ ] GHCR_PAT에 최소 권한만 부여 (`read:packages`)
- [ ] HTTPS 활성화 (Caddy 자동 처리)
- [ ] 정기적인 시스템 업데이트
- [ ] GHCR_PAT 만료 전 갱신

---

## 🐛 트러블슈팅

### Docker 이미지 pull 실패

```bash
# 에러: unauthorized: unauthenticated
# 원인: GHCR_PAT가 만료되었거나 잘못됨

# 해결: GitHub에서 새 PAT 생성 후 GHCR_PAT 시크릿 업데이트
```

### Caddy HTTPS 인증서 발급 실패

```bash
# DNS 전파 확인
nslookup api.lolog.site

# Caddy 로그 확인
sudo journalctl -u caddy -f

# Caddy 재시작
sudo systemctl restart caddy
```

### API 컨테이너 시작 실패

```bash
# 컨테이너 로그 확인
docker logs lolog-api

# 환경 변수 확인
docker inspect lolog-api | grep -A 50 "Env"
```

### Health check 실패

```bash
# 컨테이너 내부에서 테스트
docker exec lolog-api wget -qO- http://localhost:3000/health

# 포트 바인딩 확인
docker port lolog-api
```

---

## 📁 생성된 파일 목록

```
turbo-local-market/
├── .github/
│   └── workflows/
│       └── deploy-api.yml      # GitHub Actions CI/CD
├── apps/
│   └── api/
│       ├── Dockerfile          # Multi-stage Docker 빌드 (turbo prune)
│       ├── .dockerignore       # Docker 빌드 제외 파일
│       ├── .env.example        # 환경 변수 템플릿
│       └── src/
│           └── app.ts          # /health 엔드포인트 추가됨
├── deploy/
│   ├── Caddyfile              # Caddy 설정 (참고용)
│   └── setup-instance.sh      # 인스턴스 초기 설정 스크립트
├── docs/
│   └── deployment/
│       └── API_DEPLOYMENT.md  # 이 문서
└── .dockerignore              # 루트 레벨 Docker 제외 파일
```

---

## 📚 참고 자료

- [Turborepo Docker Guide](https://turbo.build/repo/docs/guides/docker)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Caddy Server](https://caddyserver.com/docs/)
- [Oracle Cloud Free Tier](https://www.oracle.com/cloud/free/)

---

**문의**: 배포 관련 문제가 발생하면 GitHub Issues를 통해 문의해주세요.
