# Security Policies

## 개요

**Defense in depth** - 여러 겹의 보안 조치. 단일 실패점 없음.

## 보안 아키텍처

```
┌─────────────────────────────────────────────────────┐
│ Layer 1: Application (Hono)                         │
│ - Secure headers                                    │
│ - CORS policy                                       │
│ - CSRF protection                                   │
│ - Body size limits                                  │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│ Layer 2: Authentication                             │
│ - Session-based auth                                │
│ - HttpOnly cookies                                  │
│ - OAuth with PKCE                                   │
│ - Rate limiting                                     │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│ Layer 3: Authorization                              │
│ - Resource ownership checks                         │
│ - ACL enforcement                                   │
└─────────────────────────────────────────────────────┘
```

## Secure Headers

### CSP (Content Security Policy)

**Dual Policy**: API vs Documentation

```typescript
// API routes: Strict CSP
const apiCsp = [
  "default-src 'none'",
  "frame-ancestors 'none'",
  "base-uri 'none'",
  "form-action 'none'",
].join("; ");

// Docs routes (/docs): Relaxed CSP for Scalar UI
const docsCsp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
].join("; ");
```

### Security Headers

| Header                   | Value                             | Reason               |
| ------------------------ | --------------------------------- | -------------------- |
| `X-Content-Type-Options` | `nosniff`                         | MIME sniffing 방지   |
| `X-Frame-Options`        | `DENY`                            | Clickjacking 방지    |
| `Referrer-Policy`        | `strict-origin-when-cross-origin` | referrer 누출 최소화 |
| `Permissions-Policy`     | 다양한 기능 제한                  | 브라우저 API 제한    |

## CSRF Protection

### Implementation

```typescript
app.use(
  "/api/*",
  csrf({
    origin: config.FRONTEND_URL,
  }),
);
```

### OAuth CSRF

**State Parameter**: OAuth flow에서 추가 CSRF 방어

```typescript
const state = arctic.generateState();
setCookie(c, "oauth_state", state);

// callback에서 검증
if (cookieState !== queryState) {
  throw new Error("CSRF detected");
}
```

## CORS Policy

### Configuration

```typescript
app.use(
  "*",
  cors({
    origin: [config.FRONTEND_URL],
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Idempotency-Key", "X-Request-ID"],
  }),
);
```

## Rate Limiting

### Rate Limit Tiers

| Endpoint                           | Window | Max | Purpose                |
| ---------------------------------- | ------ | --- | ---------------------- |
| `POST /api/auth/magic-link`        | 1 min  | 5   | Email spam prevention  |
| `POST /api/auth/verify-magic-link` | 1 min  | 10  | Token brute force      |
| All `/api/*`                       | 1 min  | 60  | General API protection |

## 입력 검증

### Zod Schema Validation

**All external input validated**:

```typescript
request: {
  body: {
    content: {
      'application/json': {
        schema: z.object({
          email: z.email(),
          title: z.string().min(1).max(200),
        }),
      },
    },
  },
}
```

### Body Size Limits

```typescript
app.use(
  "*",
  bodyLimit({
    maxSize: 256 * 1024, // 256KB
    onError: () => c.text("Request Entity Too Large", 413),
  }),
);
```

## 세션 보안

### Cookie Attributes

| Attribute  | Production | Development |
| ---------- | ---------- | ----------- |
| `httpOnly` | ✅         | ✅          |
| `secure`   | ✅         | ❌          |
| `sameSite` | `lax`      | `lax`       |
| `path`     | `/`        | `/`         |

## 보안 체크리스트

### New Endpoint Checklist

- [ ] **Authentication**: `requireAuth` middleware 적용?
- [ ] **Authorization**: 리소스 소유권 확인?
- [ ] **Input validation**: Zod schema 정의?
- [ ] **Rate limiting**: 민감한 엔드포인트?
- [ ] **Error messages**: 정보 누출 없음?

## 참고 문서

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [secure-headers.ts](../../../apps/api/src/middleware/secure-headers.ts)
- [rate-limit.ts](../../../apps/api/src/middleware/rate-limit.ts)
