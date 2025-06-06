import { isUser } from "@/api/middlewares/role.middleware";
import {
  EmailLoginBodyDto,
  EmailRegisterBodyDto,
  EmailVerifyBodyDto,
  SessionResponseDto,
  SocialLoginBodyDto,
} from "@/application/dtos/platform/auth.dto";
import { createErrorResponseDto, createResponseDto } from "@/common/utils/dto";
import { createRoute } from "@hono/zod-openapi";
import status from "http-status";

const TAG = ["auth"];

export const loginWithKakao = createRoute({
  summary: "카카오 로그인",
  method: "get",
  path: "/kakao",
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

export const kakaoSocialLogin = createRoute({
  summary: "카카오 소셜 로그인",
  method: "post",
  path: "/kakao/login",
  tags: TAG,
  request: {
    body: {
      content: {
        "application/json": {
          schema: SocialLoginBodyDto,
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
          schema: createErrorResponseDto(),
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
  middleware: [isUser] as const,
  responses: {
    [status.OK]: {
      description: "세션 조회 성공",
      content: {
        "application/json": {
          schema: createResponseDto(SessionResponseDto),
        },
      },
    },
    [status.UNAUTHORIZED]: {
      description: "세션 조회 실패",
      content: {
        "application/json": {
          schema: createErrorResponseDto(),
        },
      },
    },
  },
});

export const emailLogin = createRoute({
  summary: "이메일 로그인",
  method: "post",
  path: "/email/login",
  tags: TAG,
  request: {
    body: {
      content: {
        "application/json": {
          schema: EmailLoginBodyDto,
        },
      },
    },
  },
  responses: {
    [status.CREATED]: {
      description: "이메일 로그인 성공",
    },
    [status.BAD_REQUEST]: {
      description: "이메일 로그인 실패",
      content: {
        "application/json": {
          schema: createErrorResponseDto(),
        },
      },
    },
  },
});

export const emailRegister = createRoute({
  summary: "이메일 회원가입",
  method: "post",
  path: "/email/register",
  tags: TAG,
  request: {
    body: {
      content: {
        "application/json": {
          schema: EmailRegisterBodyDto,
        },
      },
    },
  },
  responses: {
    [status.CREATED]: {
      description: "이메일 회원가입 성공",
    },
    [status.BAD_REQUEST]: {
      description: "이메일 회원가입 실패",
      content: {
        "application/json": {
          schema: createErrorResponseDto(),
        },
      },
    },
    [status.CONFLICT]: {
      description: "이메일 회원가입 실패",
      content: {
        "application/json": {
          schema: createErrorResponseDto(),
        },
      },
    },
  },
});

export const emailVerify = createRoute({
  summary: "이메일 인증",
  method: "post",
  path: "/email/verify",
  tags: TAG,
  request: {
    body: {
      content: {
        "application/json": {
          schema: EmailVerifyBodyDto,
        },
      },
    },
  },
  responses: {
    [status.NO_CONTENT]: {
      description: "이메일 인증 성공",
    },
    [status.BAD_REQUEST]: {
      description: "이메일 인증 실패",
      content: {
        "application/json": {
          schema: createErrorResponseDto(),
        },
      },
    },
  },
});
