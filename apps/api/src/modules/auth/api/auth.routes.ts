import { createRoute } from "@hono/zod-openapi";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  AuthResponseSchema,
  EmailSentResponseSchema,
  EmailSigninRequestSchema,
  EmailSignupRequestSchema,
  EmailVerifyRequestSchema,
  ErrorResponseSchema,
  KakaoSigninRequestSchema,
  SignoutResponseSchema,
  UserSchema,
} from "./auth.schema";

export const emailSignupRoute = createRoute({
  method: "post",
  path: "/auth/email/signup",
  tags: ["Auth"],
  summary: "Email signup with magic link",
  request: {
    body: {
      content: {
        "application/json": {
          schema: EmailSignupRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: EmailSentResponseSchema,
        },
      },
      description: "Magic link sent to email",
    },
    400: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Bad request",
    },
    401: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "User already exists",
    },
  },
});

export const emailSigninRoute = createRoute({
  method: "post",
  path: "/auth/email/signin",
  tags: ["Auth"],
  summary: "Email signin with magic link",
  request: {
    body: {
      content: {
        "application/json": {
          schema: EmailSigninRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: EmailSentResponseSchema,
        },
      },
      description: "Magic link sent to email",
    },
    400: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Bad request",
    },
    404: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "User not found",
    },
  },
});

export const kakaoSigninRoute = createRoute({
  method: "post",
  path: "/auth/kakao/signin",
  tags: ["Auth"],
  summary: "Kakao OAuth signin",
  request: {
    body: {
      content: {
        "application/json": {
          schema: KakaoSigninRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: AuthResponseSchema,
        },
      },
      description: "Successfully authenticated",
    },
    400: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Kakao authentication failed",
    },
  },
});

export const emailVerifyRoute = createRoute({
  method: "post",
  path: "/auth/email/verify",
  tags: ["Auth"],
  summary: "Verify email magic link",
  request: {
    body: {
      content: {
        "application/json": {
          schema: EmailVerifyRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: AuthResponseSchema,
        },
      },
      description: "Successfully authenticated",
    },
    400: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Invalid or expired token",
    },
    401: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Token expired or already used",
    },
  },
});

export const meRoute = createRoute({
  method: "get",
  path: "/auth/me",
  tags: ["Auth"],
  summary: "Get current user",
  security: [
    {
      SessionCookie: [],
    },
  ],
  middleware: [authMiddleware] as const,
  responses: {
    200: {
      content: {
        "application/json": {
          schema: UserSchema,
        },
      },
      description: "Current user information",
    },
    401: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Unauthorized",
    },
    404: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "User not found",
    },
  },
});

export const signoutRoute = createRoute({
  method: "post",
  path: "/auth/signout",
  tags: ["Auth"],
  summary: "Sign out current session",
  security: [
    {
      SessionCookie: [],
    },
  ],
  middleware: [authMiddleware] as const,
  responses: {
    200: {
      content: {
        "application/json": {
          schema: SignoutResponseSchema,
        },
      },
      description: "Successfully signed out",
    },
    401: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Unauthorized",
    },
  },
});

export const signoutAllRoute = createRoute({
  method: "post",
  path: "/auth/signout/all",
  tags: ["Auth"],
  summary: "Sign out all sessions",
  security: [
    {
      SessionCookie: [],
    },
  ],
  middleware: [authMiddleware] as const,
  responses: {
    200: {
      content: {
        "application/json": {
          schema: SignoutResponseSchema,
        },
      },
      description: "Successfully signed out from all sessions",
    },
    401: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Unauthorized",
    },
  },
});
