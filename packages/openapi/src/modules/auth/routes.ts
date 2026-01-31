import { createRoute, z } from "@hono/zod-openapi";
import { ErrorResponseSchema } from "@repo/contracts/common";
import {
  AuthLogoutResponseSchema,
  AuthMeResponseSchema,
  MagicLinkRequestResponseSchema,
  MagicLinkRequestSchema,
} from "@repo/contracts/auth";

export const authGoogleRoute = createRoute({
  tags: ["auth"],
  method: "get",
  path: "/api/auth/google",
  summary: "Google OAuth 시작",
  description:
    "Google 로그인 페이지로 리다이렉트합니다.\n\n**옵션**: `redirectPath`로 로그인 후 이동할 경로 지정",
  request: {
    query: z.object({
      redirectPath: z.string().min(1).optional(),
    }),
  },
  responses: {
    302: {
      description: "Google OAuth consent page로 리다이렉트합니다.",
    },
    default: {
      description: "에러 응답",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});

export const authGoogleCallbackRoute = createRoute({
  tags: ["auth"],
  method: "get",
  path: "/api/auth/google/callback",
  summary: "Google OAuth 콜백",
  description:
    "Google OAuth 인증 완료 후 콜백 처리를 담당합니다. 세션 쿠키를 발급합니다.",
  request: {
    query: z.object({
      code: z.string().min(1).optional(),
      state: z.string().min(1).optional(),
      error: z.string().optional(),
      error_description: z.string().optional(),
    }),
  },
  responses: {
    302: {
      description: "세션 쿠키를 설정한 뒤 redirectPath로 리다이렉트합니다.",
    },
    default: {
      description: "에러 응답",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});

export const authRequestMagicLinkRoute = createRoute({
  tags: ["auth"],
  method: "post",
  path: "/api/auth/magic-link",
  summary: "이메일 매직링크 요청",
  description:
    "입력한 이메일로 로그인 링크를 전송합니다. 비밀번호 없이 로그인할 수 있습니다.",
  request: {
    body: {
      content: {
        "application/json": {
          schema: MagicLinkRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "매직링크 전송 요청이 접수되었습니다.",
      content: {
        "application/json": {
          schema: MagicLinkRequestResponseSchema,
        },
      },
    },
    default: {
      description: "에러 응답",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});

export const authVerifyMagicLinkRoute = createRoute({
  tags: ["auth"],
  method: "get",
  path: "/api/auth/magic-link/verify",
  summary: "매직링크 검증",
  description: "이메일의 매직링크 토큰을 검증하고 세션을 생성합니다.",
  request: {
    query: z.object({
      token: z.string().min(1),
    }),
  },
  responses: {
    302: {
      description: "세션 쿠키를 설정한 뒤 redirectPath로 리다이렉트합니다.",
    },
    default: {
      description: "에러 응답",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});

export const authMeRoute = createRoute({
  tags: ["auth"],
  method: "get",
  path: "/api/auth/me",
  summary: "현재 사용자 조회",
  description:
    "현재 로그인한 사용자의 정보를 조회합니다. 인증 상태 확인에 사용됩니다.",
  responses: {
    200: {
      description: "현재 로그인한 사용자를 반환합니다.",
      content: {
        "application/json": {
          schema: AuthMeResponseSchema,
        },
      },
    },
    default: {
      description: "에러 응답",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
  security: [{ cookieAuth: [] }],
});

export const authLogoutRoute = createRoute({
  tags: ["auth"],
  method: "post",
  path: "/api/auth/logout",
  summary: "로그아웃",
  description: "현재 세션을 종료하고 쿠키를 삭제합니다.",
  responses: {
    200: {
      description: "로그아웃되었습니다.",
      content: {
        "application/json": {
          schema: AuthLogoutResponseSchema,
        },
      },
    },
    default: {
      description: "에러 응답",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
  security: [{ cookieAuth: [] }],
});

export const authRoutes = [
  authGoogleRoute,
  authGoogleCallbackRoute,
  authRequestMagicLinkRoute,
  authVerifyMagicLinkRoute,
  authMeRoute,
  authLogoutRoute,
] as const;
