# Authentication & Session Management

## 개요

**Cookie-based session authentication** with **stateless session validation**. JWT 대신 서버 측 세션 저장소 사용.

## 설계 결정

### 1. Cookie over JWT

| 접근법      | 저장소     | 무효화         | 복잡성       |
| ----------- | ---------- | -------------- | ------------ |
| JWT         | 클라이언트 | Blacklist 필요 | Stateless    |
| **Session** | **서버**   | **즉시 가능**  | **Stateful** |

**결정**: 서버 측 세션 사용

**근거**:

- **즉시 로그아웃**: 세션 삭제로 즉시 무효화
- **보안 감사**: 세션 메타데이터(IP, UA) 저장 가능
- **세션 관리**: 사용자별 활성 세션 조회/관리
- **로그아웃 모든 기기**: 가능

### 2. Session Token Format

**Opaque token** (random string) - 의미 없는 식별자

```
Session Token: base64url(random 32 bytes)
→ Session Store (DB)에서 lookup
```

**Cookie Name**: `__Secure-{name}` (production) or `{name}` (dev)

**Cookie Attributes**:

- `httpOnly`: XSS 방어
- `secure`: HTTPS only (production)
- `sameSite: 'lax'`: CSRF 방어
- `path: '/'`: 전체 사이트
- `maxAge`: SESSION_DURATION_DAYS (default 7일)

## 인증 방법

### 1. Google OAuth 2.0 + PKCE

**Flow**:

```
1. Client → GET /api/auth/google?redirectPath=/home
                    ↓
2. Server: state, code_verifier 생성 → Cookie 저장
                    ↓
3. Server → Redirect to Google (authorization_url)
                    ↓
4. User authenticates with Google
                    ↓
5. Google → Redirect to /api/auth/google/callback?code=...&state=...
                    ↓
6. Server: state 검증 → code + code_verifier로 token exchange
                    ↓
7. Server: Google userinfo → User 생성/조회
                    ↓
8. Server: Session 생성 → Cookie 설정 → Redirect to redirectPath
```

**보안 조치**:

- **PKCE**: code_verifier로 authorization code 교환 보호
- **State Parameter**: CSRF 방어 (Cookie에 저장, callback에서 검증)
- **Path-restricted Cookies**: OAuth 쿠키는 `/api/auth/google` 경로로 제한
- **Short-lived Cookies**: 10분 만료
- **Redirect Validation**: 화이트리스트 기반 redirectPath 검증

**OAuth Cookie Names**:

- `oauth_state`: CSRF 방어
- `oauth_code_verifier`: PKCE
- `oauth_redirect_path`: 로그인 후 리다이렉트 경로

### 2. Magic Link (Email)

**Flow**:

```
1. Client → POST /api/auth/magic-link { email, redirectPath }
                    ↓
2. Server: Magic token 생성 → 이메일 발송
                    ↓
3. User: 이메일 클릭 → GET /api/auth/verify-magic-link?token=...
                    ↓
4. Server: Token 검증 → Session 생성 → Cookie 설정 → Redirect
```

**보안 조치**:

- **Rate Limiting**: `/api/auth/magic-link`는 IP당 5req/min
- **Token Expiration**: 15분 만료
- **Single Use**: 검증 후 즉시 삭제
- **Email Delivery**: Resend API 사용, 로그로 전송 (dev)

## 세션 관리

### 세션 생명주기

```
┌─────────────────────────────────────────┐
│ 1. Creation                             │
│    - Login (OAuth/Magic Link)           │
│    - New session record                 │
│    - Cookie set                         │
└─────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│ 2. Validation (every request)           │
│    - Cookie parsing                     │
│    - DB lookup                          │
│    - Metadata update (lastActiveAt)     │
└─────────────────────────────────────────┘
                   │
         ┌─────────┴─────────┐
         ▼                   ▼
┌─────────────────┐  ┌─────────────────┐
│ 3a. Logout      │  │ 3b. Expiration  │
│    - Cookie     │  │    - 7일 경과   │
│      deletion   │  │    - Auto       │
│    - DB record  │  │      cleanup    │
│      deletion   │  │                 │
└─────────────────┘  └─────────────────┘
```

### 세션 메타데이터

```typescript
interface Session {
  id: string;
  userId: string;
  token: string; // Opaque token (hashed)
  ipAddress?: string; // 생성/마지막 사용 IP
  userAgent?: string; // 생성/마지막 사용 UA
  createdAt: Date;
  expiresAt: Date;
  lastActiveAt: Date;
}
```

**IP/UA Tracking 목적**:

- 보안 감사 로그
- 의심스러운 활동 감지 (향후 기능)
- 사용자 세션 관리 UI

## 미들웨어 구현

### Auth Middleware Types

```typescript
// middleware/auth.ts

// 1. Required Auth - 인증 필수
export function createRequireAuthMiddleware(deps: {
  config: Config;
  authService: AuthService;
}): MiddlewareHandler<{ Variables: AuthVariables }>;

// 2. Optional Auth - 인증 선택적
export function createOptionalAuthMiddleware(deps: {
  config: Config;
  authService: AuthService;
}): MiddlewareHandler<{ Variables: OptionalAuthVariables }>;
```

### Route에서 사용

```typescript
export function registerRoutes(app: OpenAPIHono, deps: AppDeps): void {
  const requireAuth = createRequireAuthMiddleware(deps);
  const optionalAuth = createOptionalAuthMiddleware(deps);

  // 인증 필수
  app.openapi(
    { ...authMeRoute, middleware: [requireAuth] as const },
    async (c) => {
      const auth = c.get("auth"); // AuthContext
      return c.json({ data: auth.user }, 200);
    },
  );

  // 인증 선택적
  app.openapi(
    { ...someRoute, middleware: [optionalAuth] as const },
    async (c) => {
      const auth = c.get("auth"); // AuthContext | undefined
    },
  );
}
```

### AuthContext

**미들웨어가 설정하는 변수**:

```typescript
interface AuthContext {
  user: {
    id: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
  };
  session: {
    id: string;
    token: string;
    expiresAt: Date;
  };
}
```

## 보안 고려사항

### Cookie Security

**Production 설정**:

```typescript
setCookie(c, SESSION_COOKIE_NAME_FULL, token, {
  httpOnly: true,
  secure: true, // HTTPS only
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7일
});
```

### 세션 하이재킹 방지

1. **HttpOnly Cookie**: JavaScript 접근 불가 (XSS 방어)
2. **Secure Flag**: HTTPS 전송만 허용 (MITM 방어)
3. **SameSite=Lax**: CSRF 기본 방어
4. **Short Expiration**: 7일 (재인증 필요)
5. **IP/UA Tracking**: 의심스러운 세션 감지 가능

### Rate Limiting

**인증 관련 엔드포인트**:

| Endpoint                      | Limit      | Purpose               |
| ----------------------------- | ---------- | --------------------- |
| `/api/auth/magic-link`        | 5 req/min  | 이메일 남용 방지      |
| `/api/auth/verify-magic-link` | 10 req/min | 토큰 brute-force 방지 |
| `/api/*` (general)            | 60 req/min | 일반 DoS 방어         |

## 에러 처리

### 인증 에러

| Error Code                    | HTTP Status | Scenario                     |
| ----------------------------- | ----------- | ---------------------------- |
| `UNAUTHORIZED`                | 401         | 세션 쿠키 없음               |
| `SESSION_EXPIRED`             | 401         | 세션 만료                    |
| `INVALID_REDIRECT`            | 400         | 화이트리스트 외 redirectPath |
| `GOOGLE_OAUTH_NOT_CONFIGURED` | 500         | OAuth 설정 누락              |
| `MAGIC_LINK_EXPIRED`          | 400         | Magic link 만료              |
| `MAGIC_LINK_INVALID`          | 400         | Magic link 토큰 오류         |

## 환경 변수

**Config** ([lib/config.ts](../../../apps/api/src/lib/config.ts)):

```typescript
SESSION_COOKIE_NAME: string;        // default: "session"
SESSION_DURATION_DAYS: number;      // default: 7
COOKIE_SECURE: boolean;             // production: true

GOOGLE_CLIENT_ID?: string;
GOOGLE_CLIENT_SECRET?: string;

EMAIL_DELIVERY_MODE: "resend" | "log";
RESEND_API_KEY?: string;
RESEND_EMAIL?: string;
```

## 참고 문서

- [middleware/auth.ts](../../../apps/api/src/middleware/auth.ts) - 미들웨어 구현
- [routes/auth.ts](../../../apps/api/src/routes/auth.ts) - 라우트 구현
- [packages/core/modules/auth](../../../packages/core/src/modules/auth) - 인증 서비스
