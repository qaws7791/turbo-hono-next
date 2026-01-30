# 인증 시스템

Learning OS의 인증 아키텍처와 보안 정책을 설명합니다.

**API 상세**: [Scalar 문서](/docs)에서 `/api/auth/*` 엔드포인트 확인

---

## 인증 방식

| 방식            | 프로토콜     | 용도               | 특징                  |
| --------------- | ------------ | ------------------ | --------------------- |
| Google OAuth    | OAuth 2.0    | 간편 로그인        | email, profile 스코프 |
| 이메일 매직링크 | Passwordless | 이메일 기반 로그인 | 15분 유효, 일회용     |

**선택 근거**: 비밀번호 관리 부담 제거, 빠른 온보딩

---

## 세션 관리

### 세션 쿠키

| 속성     | 값                                  | 보안 목적                |
| -------- | ----------------------------------- | ------------------------ |
| Name     | 환경변수 `SESSION_COOKIE_NAME` 설정 | -                        |
| HttpOnly | true                                | XSS 방어                 |
| Secure   | 환경변수 `COOKIE_SECURE` 설정       | MITM 방어                |
| SameSite | Lax                                 | CSRF 방어                |
| Max-Age  | 환경변수 `SESSION_DURATION_DAYS`    | 사용자 편의 vs 보안 균형 |
| Path     | /                                   | 전체 도메인              |

**환경 변수**: `SESSION_COOKIE_NAME`, `SESSION_DURATION_DAYS`, `COOKIE_SECURE`

### 세션 갱신

- **Sliding Window**: 요청 시마다 만료 시간 갱신
- **최대 30일**: 강제 만료로 무한 연장 방지

### 세션 저장

```sql
auth_sessions
├── session_token_hash (SHA-256)
├── user_id
├── expires_at
├── revoked_at        -- 수동 폐기
├── created_ip        -- 보안 감사
└── user_agent        -- 보안 감사
```

**근거**: 토큰 원본 미저장(해시만), 폐기 이력 보관

---

## 보안 정책

### CSRF 방지

#### OAuth PKCE + State 검증

1. 시작 시 랜덤 `state`와 `codeVerifier` 생성 → 쿠키 저장
2. 콜백 시 state 파라미터와 쿠키 비교
3. PKCE code_verifier로 토큰 교환
4. 불일치 시 요청 거부

**OAuth 쿠키** (10분 만료):

- `oauth_state`: CSRF 방지용 state
- `oauth_code_verifier`: PKCE 검증용
- `oauth_redirect_path`: 로그인 후 리다이렉트 경로

#### SameSite Cookie

크로스 사이트 요청 시 쿠키 미전송으로 CSRF 차단

### Redirect Allowlist

매직링크/OAuth 콜백의 리다이렉트 경로 제한:

```typescript
const ALLOWED_REDIRECT_PATHS = [
  "/home",
  "/plans",
  "/materials",
  "/session",
  // 외부 URL 불허
];
```

**위험**: 공격자가 악성 사이트로 리다이렉트하여 인증 쿠키 탈취

### Token 보안

#### 매직링크 토큰

- 원본 저장 금지, **SHA-256 해시만** 저장
- 단일 사용 (`consumed_at` 기록)
- IP/User-Agent 로깅 (이상 감지)

```typescript
// 생성
const token = crypto.randomBytes(32).toString("hex");
const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

// 저장 (tokenHash만)
await db.insert(magicLinkTokens).values({
  tokenHash,
  expiresAt: dayjs().add(15, "minute").toDate(),
});
```

### Rate Limiting

| 엔드포인트                  | 제한 | 기간 | 목적             |
| --------------------------- | ---- | ---- | ---------------- |
| POST /auth/magic-link       | 5회  | 분당 | 이메일 폭탄 방지 |
| GET /auth/magic-link/verify | 10회 | 분당 | 토큰 추측 방지   |

---

## 미들웨어 구현

### 인증 필수 미들웨어

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

### 사용 예시

```typescript
// Route 정의
app.get("/api/plans", requireAuth, async (c) => {
  const user = c.get("user");
  const plans = await getPlansForUser(user.id);
  return c.json({ data: plans });
});
```

---

## 에러 처리

| 상황            | 코드               | HTTP | 처리               |
| --------------- | ------------------ | ---- | ------------------ |
| 미인증          | UNAUTHORIZED       | 401  | 로그인 페이지 이동 |
| 세션 만료       | SESSION_EXPIRED    | 401  | 로그인 페이지 이동 |
| 매직링크 만료   | MAGIC_LINK_EXPIRED | 400  | 재요청 안내        |
| 매직링크 사용됨 | MAGIC_LINK_USED    | 400  | 재요청 안내        |

---

## 개발 환경

`NODE_ENV=development`에서 이메일 실제 전송 안함:

```
[development] Magic Link: https://.../verify?token=xxx
```

**환경 변수**: `EMAIL_DELIVERY_MODE=log` (기본값: development)

---

## 관련 문서

- [API 개요](./overview.md)
- [에러 코드](./errors.md)
- [Login 페이지](../../03-product/pages/login.md)
