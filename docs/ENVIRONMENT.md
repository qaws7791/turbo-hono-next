# Environment Variables

이 문서는 프로젝트에서 사용하는 환경변수 목록과 환경별 설정 차이를 안내합니다.

---

## 필수 환경변수

### 데이터베이스

| 변수           | 설명                   | 예시                                  |
| -------------- | ---------------------- | ------------------------------------- |
| `DATABASE_URL` | PostgreSQL 연결 문자열 | `postgresql://user:pass@host:5432/db` |

### 스토리지

| 변수                   | 설명               | 예시                    |
| ---------------------- | ------------------ | ----------------------- |
| `R2_ACCOUNT_ID`        | Cloudflare 계정 ID | `abc123`                |
| `R2_ACCESS_KEY_ID`     | R2 Access Key      |                         |
| `R2_SECRET_ACCESS_KEY` | R2 Secret Key      |                         |
| `R2_BUCKET_NAME`       | 버킷 이름          | `learning-os-materials` |

### AI

| 변수             | 설명          | 예시     |
| ---------------- | ------------- | -------- |
| `OPENAI_API_KEY` | OpenAI API 키 | `sk-...` |

### 인증

| 변수                   | 설명                   | 예시                  |
| ---------------------- | ---------------------- | --------------------- |
| `GOOGLE_CLIENT_ID`     | Google OAuth Client ID |                       |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Secret    |                       |
| `SESSION_SECRET`       | 세션 암호화 키         | 32자 이상 랜덤 문자열 |

### 앱 설정

| 변수       | 설명        | 예시                         |
| ---------- | ----------- | ---------------------------- |
| `BASE_URL` | 앱 기본 URL | `http://localhost:3000`      |
| `NODE_ENV` | 환경        | `development` / `production` |

---

## 선택 환경변수

| 변수             | 설명           | 기본값 |
| ---------------- | -------------- | ------ |
| `LOG_LEVEL`      | 로그 레벨      | `info` |
| `RATE_LIMIT_MAX` | 분당 최대 요청 | `60`   |

---

## 환경별 설정

### Local (development)

```env
NODE_ENV=development
BASE_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/learning_os
```

### Staging

```env
NODE_ENV=production
BASE_URL=https://staging.learning-os.app
# NeonDB 연결 문자열
```

### Production

```env
NODE_ENV=production
BASE_URL=https://learning-os.app
# 프로덕션 시크릿은 별도 관리
```

---

## 시크릿 관리

### 로컬

- `.env.local` 파일 사용
- Git에 커밋 금지 (`.gitignore`에 포함)

### 배포 환경

- 환경변수 관리 서비스 사용 (Vercel, Railway 등)
- 직접 하드코딩 금지

---

## .env.example

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/learning_os

# Storage
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=learning-os-dev

# AI
OPENAI_API_KEY=sk-...

# Auth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
SESSION_SECRET=generate-a-random-32-char-string

# App
BASE_URL=http://localhost:3000
NODE_ENV=development
```
