import { createRoute, z } from "@hono/zod-openapi";
import status from "http-status";

const TAG = ["auth"];

export const kakaoLogin = createRoute({
  summary: "카카오 로그인",
  method: "get",
  path: "/kakao/login",
  tags: TAG,
  responses: {
    [status.FOUND]: {
      description: "카카오 로그인 페이지로 리다이렉트",
      headers: {
        Location: {
          description: "카카오 로그인 페이지 URL",
          schema: {
            type: "string",
            example: "https://kauth.kakao.com/oauth/authorize?client_id=...",
          },
        },
      },
    },
  },
});

export const socialLogin = createRoute({
  summary: "소셜 로그인",
  method: "post",
  path: "/social/login",
  tags: TAG,
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            provider: z.enum(["google", "kakao"]),
            token: z.string(),
          }),
        },
      },
    },
  },
  responses: {
    [status.CREATED]: {
      description: "소셜 로그인 성공",
      headers: {
        "Set-Cookie": {
          description: "session cookie",
          schema: {
            type: "string",
            example:
              "9f8d0a7e3c63b02e5c487e245e97231b1e0c96fd9b45c40300d63dc3ed370194",
          },
        },
      },
    },
    [status.BAD_REQUEST]: {
      description: "회원가입 실패",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
  },
});

export const logout = createRoute({
  summary: "로그아웃",
  method: "post",
  path: "/logout",
  tags: TAG,
  responses: {
    [status.NO_CONTENT]: {
      description: "로그아웃 성공",
    },
  },
});

export const session = createRoute({
  summary: "세션 조회",
  method: "get",
  path: "/session",
  tags: TAG,
  responses: {
    [status.OK]: {
      description: "세션 조회 성공",
      content: {
        "application/json": {
          schema: z.object({
            userId: z.number(),
            ipAddress: z.string(),
            userAgent: z.string(),
          }),
        },
      },
    },
    [status.UNAUTHORIZED]: {
      description: "세션 조회 실패",
    },
  },
});
