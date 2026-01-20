import { secureHeaders } from "hono/secure-headers";

export const secureHeadersMiddleware = secureHeaders({
  // 외부 링크 클릭 시 Referer에 origin만 전달 (토큰 유출 방지)
  referrerPolicy: "strict-origin-when-cross-origin",

  // MIME 타입 스니핑 방지
  xContentTypeOptions: "nosniff",

  // XSS 필터 비활성화 (최신 브라우저는 CSP로 대체)
  xXssProtection: false,

  // iframe 삽입 방지
  xFrameOptions: "DENY",

  // HTTPS 강제 (프로덕션 환경)
  strictTransportSecurity: "max-age=31536000; includeSubDomains",

  // CSP 설정 (API 서버용 최소 설정)
  // Scalar API Reference UI는 CDN에서 스크립트/스타일을 로드함
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
