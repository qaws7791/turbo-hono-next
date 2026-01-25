import { secureHeaders } from "hono/secure-headers";

import type { Config } from "../lib/config";

export function createSecureHeadersMiddleware(config: Config) {
  // 공통 설정
  const commonOptions = {
    // 외부 링크 클릭 시 Referer에 origin만 전달 (토큰 유출 방지)
    referrerPolicy: "strict-origin-when-cross-origin",
    // MIME 타입 스니핑 방지
    xContentTypeOptions: "nosniff",
    // XSS 필터 비활성화 (최신 브라우저는 CSP로 대체)
    xXssProtection: false,
    // iframe 삽입 방지
    xFrameOptions: "DENY",
    // HTTPS 강제 (프로덕션 환경만)
    ...(config.NODE_ENV === "production"
      ? { strictTransportSecurity: "max-age=31536000; includeSubDomains" }
      : {}),
  } as const;

  const apiMiddleware = secureHeaders({
    ...commonOptions,
    // CSP 설정 (API 서버용 엄격한 설정: unsafe-inline 제거)
    contentSecurityPolicy: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'"],
      frameAncestors: ["'none'"],
    },
  });

  const docsMiddleware = secureHeaders({
    ...commonOptions,
    // CSP 설정 (Scalar API Reference UI용 완화된 설정)
    contentSecurityPolicy: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "https://fonts.scalar.com",
      ],
      connectSrc: ["'self'"],
      frameAncestors: ["'none'"],
    },
  });

  return { apiMiddleware, docsMiddleware };
}
