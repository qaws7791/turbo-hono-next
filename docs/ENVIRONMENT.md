# Environment Variables

이 문서는 프로젝트에서 사용하는 환경변수 목록과 환경별 설정 차이를 안내합니다.

SSoT(실제 사용/검증 기준):

- API: `apps/api/src/lib/config.ts`
- Web: `apps/web/app/modules/api/env.ts`
- Turborepo: `turbo.json`

---

## `apps/api`

### 필수

| 변수           | 설명                   | 예시                                  |
| -------------- | ---------------------- | ------------------------------------- |
| `DATABASE_URL` | PostgreSQL 연결 문자열 | `postgresql://user:pass@host:5432/db` |

### 서버/앱 설정

| 변수           | 설명                         | 기본값                  |
| -------------- | ---------------------------- | ----------------------- |
| `NODE_ENV`     | 환경                         | `development`           |
| `SERVICE_NAME` | 서비스 이름                  | `LOLOG`                 |
| `PORT`         | API 포트                     | `3001`                  |
| `BASE_URL`     | API 외부 접근 URL(자기 자신) | `http://localhost:3001` |
| `FRONTEND_URL` | CORS 허용 프론트엔드 Origin  | `http://localhost:3000` |

### 세션/쿠키

| 변수                    | 설명                                               | 기본값    |
| ----------------------- | -------------------------------------------------- | --------- |
| `SESSION_COOKIE_NAME`   | 세션 쿠키 기본 이름 (실제 쿠키명: `__Secure-{값}`) | `session` |
| `SESSION_DURATION_DAYS` | 세션 만료 기간(일)                                 | `7`       |
| `COOKIE_SECURE`         | `true`/`false`(선택, 미설정 시 NODE_ENV 기반)      |           |

> **Note**: 세션 쿠키는 `__Secure-` 접두사가 자동으로 추가되며, `Domain` 속성 없이 설정됩니다.

### OAuth (선택)

| 변수                   | 설명                   | 기본값 |
| ---------------------- | ---------------------- | ------ |
| `GOOGLE_CLIENT_ID`     | Google OAuth Client ID |        |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Secret    |        |

### Email (선택)

| 변수                  | 설명             | 기본값                      |
| --------------------- | ---------------- | --------------------------- |
| `EMAIL_DELIVERY_MODE` | `log` / `resend` | 개발: `log`, 운영: `resend` |
| `RESEND_API_KEY`      | Resend API 키    |                             |
| `RESEND_EMAIL`        | 발신자 이메일    |                             |

### File Storage (선택: 업로드 기능 사용 시 필요)

| 변수                   | 설명                | 기본값 |
| ---------------------- | ------------------- | ------ |
| `R2_ACCESS_KEY_ID`     | R2 Access Key       |        |
| `R2_SECRET_ACCESS_KEY` | R2 Secret Key       |        |
| `R2_BUCKET_NAME`       | 버킷 이름           |        |
| `R2_ENDPOINT`          | R2 S3 호환 Endpoint |        |
| `R2_PUBLIC_URL`        | 공개 접근 Base URL  |        |

### AI (선택: 챗/RAG 기능 사용 시 필요)

| 변수                     | 설명              | 기본값                  |
| ------------------------ | ----------------- | ----------------------- |
| `OPENAI_API_KEY`         | OpenAI API 키     |                         |
| `OPENAI_SESSION_MODEL`   | Session 생성 모델 | `gpt-5-nano`            |
| `GEMINI_API_KEY`         | Gemini API 키     |                         |
| `GEMINI_CHAT_MODEL`      | Chat 모델         | `gemini-2.5-flash-lite` |
| `GEMINI_EMBEDDING_MODEL` | Embedding 모델    | `gemini-embedding-001`  |

---

## `apps/web`

| 변수                | 설명                               | 기본값 |
| ------------------- | ---------------------------------- | ------ |
| `VITE_API_BASE_URL` | API Base URL(비어있으면 로컬 추론) |        |

---

## 예시

### `apps/api/.env` (development)

```env
NODE_ENV=development
SERVICE_NAME=LOLOG
PORT=3001
BASE_URL=http://localhost:3001
FRONTEND_URL=http://localhost:5173

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lolog

SESSION_COOKIE_NAME=session
SESSION_DURATION_DAYS=7
COOKIE_SECURE=false

EMAIL_DELIVERY_MODE=log
RESEND_API_KEY=
RESEND_EMAIL=

R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_ENDPOINT=
R2_PUBLIC_URL=

OPENAI_API_KEY=
OPENAI_SESSION_MODEL=gpt-5-nano

GEMINI_API_KEY=
GEMINI_CHAT_MODEL=gemini-2.5-flash-lite
GEMINI_EMBEDDING_MODEL=gemini-embedding-001
```

### `apps/web/.env`

```env
VITE_API_BASE_URL=http://localhost:3001
```
