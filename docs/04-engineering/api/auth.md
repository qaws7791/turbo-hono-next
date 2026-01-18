# 인증 API

## 개요

Learning OS는 **Google OAuth**와 **이메일 매직링크** 두 가지 인증 방식을 지원합니다.

---

## 인증 방식

### 1. Google OAuth

- **타입**: OAuth 2.0
- **Scope**: email, profile
- **용도**: 간편 로그인

### 2. 이메일 매직링크

- **타입**: Passwordless
- **유효시간**: 15분
- **용도**: 이메일 기반 로그인

---

## 엔드포인트

### Google OAuth 시작

```
GET /api/auth/google?redirectPath=/home
```

**Query Parameters**:
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| redirectPath | string | 로그인 완료 후 리다이렉트 경로 (기본값: /home) |

**Response**: Redirect to Google OAuth consent page

### Google OAuth 콜백

```
GET /api/auth/google/callback?code={code}&state={state}
```

**Query Parameters**:
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| code | string | OAuth authorization code |
| state | string | CSRF 방지용 state |

**Response**: Redirect to `/home` (with session cookie)

### 매직링크 요청

```
POST /api/auth/magic-link
```

**Request Body**:

```json
{
  "email": "user@example.com",
  "redirectPath": "/home"
}
```

**Response**:

```json
{
  "message": "로그인 링크가 이메일로 전송되었습니다."
}
```

개발환경(`NODE_ENV=development|test`)에서는 기본적으로 이메일을 실제 전송하지 않고,
서버 로그에 `magic_link.dev`로 `verifyUrl`을 남깁니다. (기본값:
`EMAIL_DELIVERY_MODE=log`)

### 매직링크 검증

```
GET /api/auth/magic-link/verify?token={token}
```

**Query Parameters**:
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| token | string | 매직링크 토큰 |

**Response**: Redirect to redirectPath (with session cookie)

**Error Cases**:
| 코드 | 설명 |
|------|------|
| MAGIC_LINK_EXPIRED | 토큰 만료 (15분 초과) |
| MAGIC_LINK_USED | 이미 사용된 토큰 |
| MAGIC_LINK_INVALID | 유효하지 않은 토큰 |

### 현재 사용자 조회

```
GET /api/auth/me
```

**Response**:

```json
{
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "displayName": "홍길동",
    "avatarUrl": "https://...",
    "locale": "ko-KR",
    "timezone": "Asia/Seoul"
  }
}
```

### 로그아웃

```
POST /api/auth/logout
```

**Response**:

```json
{
  "message": "로그아웃되었습니다."
}
```

---

## 세션 관리

### 세션 쿠키

| 속성     | 값                |
| -------- | ----------------- |
| Name     | session           |
| HttpOnly | true              |
| Secure   | true (production) |
| SameSite | Lax               |
| Max-Age  | 7일               |
| Path     | /                 |

### 세션 갱신

- 요청 시마다 세션 만료 시간 갱신 (sliding window)
- 최대 30일 후 강제 만료

### 세션 저장

```sql
CREATE TABLE auth_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  session_token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 보안 정책

### CSRF 방지

**OAuth State 검증**:

1. OAuth 시작 시 랜덤 state 생성 및 쿠키 저장
2. 콜백 시 state 파라미터와 쿠키 비교
3. 불일치 시 요청 거부

**SameSite Cookie**:

- 크로스 사이트 요청 시 쿠키 전송 안함

### Redirect Allowlist

매직링크 및 OAuth 콜백의 redirect 경로 제한:

```typescript
const ALLOWED_REDIRECT_PATHS = [
  "/home",
  "/plans",
  "/materials",
  "/session",
  // 외부 URL 불허
];

function validateRedirectPath(path: string): boolean {
  return ALLOWED_REDIRECT_PATHS.some((p) => path.startsWith(p));
}
```

### Token 보안

**매직링크 토큰**:

- 원본 저장 금지, 해시만 저장
- 단일 사용 (consumed_at 기록)
- IP/User-Agent 로깅

```typescript
// 토큰 생성
const token = crypto.randomBytes(32).toString("hex");
const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

// 저장
await db.insert(magicLinkTokens).values({
  email,
  tokenHash,
  expiresAt: dayjs().add(10, "minute").toDate(),
  redirectPath,
  createdIp,
  userAgent,
});
```

### Rate Limiting

| 엔드포인트                  | 제한 | 기간 |
| --------------------------- | ---- | ---- |
| POST /auth/magic-link       | 5회  | 분당 |
| GET /auth/magic-link/verify | 10회 | 분당 |

---

## 에러 응답

### 인증 필요 (401)

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "로그인이 필요합니다."
  }
}
```

### 세션 만료 (401)

```json
{
  "error": {
    "code": "SESSION_EXPIRED",
    "message": "세션이 만료되었습니다. 다시 로그인해주세요."
  }
}
```

---

## 구현 예시

### 미들웨어

```typescript
// middleware/auth.ts
export const requireAuth = createMiddleware(async (c, next) => {
  const sessionToken = getCookie(c, "session");

  if (!sessionToken) {
    return c.json(
      { error: { code: "UNAUTHORIZED", message: "로그인이 필요합니다." } },
      401,
    );
  }

  const session = await validateSession(sessionToken);

  if (!session) {
    return c.json(
      { error: { code: "SESSION_EXPIRED", message: "세션이 만료되었습니다." } },
      401,
    );
  }

  c.set("user", session.user);
  c.set("session", session);

  await next();
});
```

### OAuth 플로우

```typescript
// routes/auth.ts
app.get("/api/auth/google", (c) => {
  const state = crypto.randomBytes(16).toString("hex");
  setCookie(c, "oauth_state", state, { httpOnly: true, sameSite: "Lax" });

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", GOOGLE_CLIENT_ID);
  url.searchParams.set("redirect_uri", `${BASE_URL}/api/auth/google/callback`);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);

  return c.redirect(url.toString());
});
```

---

## 관련 문서

- [API 개요](./overview.md)
- [에러 코드](./errors.md)
- [Login 페이지](../../03-product/pages/login.md)
