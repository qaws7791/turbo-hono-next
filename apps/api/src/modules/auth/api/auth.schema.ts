import { z } from "@hono/zod-openapi";

export const UserSchema = z
  .object({
    id: z.number().int().positive().openapi({
      description: "사용자 고유 ID",
      example: 1,
    }),
    email: z.string().email().openapi({
      description: "사용자 이메일 주소",
      example: "user@example.com",
    }),
    username: z.string().min(3).max(20).openapi({
      description: "사용자명 (3-20자)",
      example: "john_doe",
    }),
    displayName: z.string().min(1).max(50).openapi({
      description: "표시 이름 (1-50자)",
      example: "John Doe",
    }),
    profileImage: z.string().url().nullable().openapi({
      description: "프로필 이미지 URL",
      example: "https://example.com/avatar.jpg",
    }),
    bio: z.string().max(200).nullable().openapi({
      description: "자기소개 (최대 200자)",
      example: "안녕하세요! 저는 크리에이터입니다.",
    }),
    role: z.enum(["user", "creator"]).openapi({
      description: "사용자 역할",
      example: "user",
      enum: ["user", "creator"],
    }),
    createdAt: z.string().datetime().openapi({
      description: "계정 생성일",
      example: "2024-01-01T00:00:00.000Z",
      format: "date-time",
    }),
    updatedAt: z.string().datetime().openapi({
      description: "최종 수정일",
      example: "2024-01-01T00:00:00.000Z",
      format: "date-time",
    }),
  })
  .openapi({
    description: "사용자 정보",
    example: {
      id: 1,
      email: "user@example.com",
      username: "john_doe",
      displayName: "John Doe",
      profileImage: null,
      bio: null,
      role: "user",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    },
  });

export const SessionSchema = z
  .object({
    id: z.number().int().positive().openapi({
      description: "세션 고유 ID",
      example: 1,
    }),
    userId: z.number().int().positive().openapi({
      description: "사용자 ID",
      example: 1,
    }),
    token: z.string().min(1).openapi({
      description: "세션 토큰",
      example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    }),
    expiresAt: z.string().datetime().openapi({
      description: "세션 만료일",
      example: "2024-12-31T23:59:59.000Z",
      format: "date-time",
    }),
    createdAt: z.string().datetime().openapi({
      description: "세션 생성일",
      example: "2024-01-01T00:00:00.000Z",
      format: "date-time",
    }),
  })
  .openapi({
    description: "사용자 세션 정보",
    example: {
      id: 1,
      userId: 1,
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      expiresAt: "2024-12-31T23:59:59.000Z",
      createdAt: "2024-01-01T00:00:00.000Z",
    },
  });

export const AuthResponseSchema = z
  .object({
    user: UserSchema,
    session: SessionSchema,
  })
  .openapi({
    description: "인증 성공 응답",
    example: {
      user: {
        id: 1,
        email: "user@example.com",
        username: "john_doe",
        displayName: "John Doe",
        profileImage: null,
        bio: null,
        role: "user",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      },
      session: {
        id: 1,
        userId: 1,
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        expiresAt: "2024-12-31T23:59:59.000Z",
        createdAt: "2024-01-01T00:00:00.000Z",
      },
    },
  });

export const EmailSentResponseSchema = z
  .object({
    message: z.string().min(1).openapi({
      description: "응답 메시지",
      example: "인증 이메일이 발송되었습니다",
    }),
    email: z.string().email().openapi({
      description: "이메일이 발송된 주소",
      example: "user@example.com",
    }),
    expiresIn: z.number().int().positive().openapi({
      description: "토큰 만료 시간 (초)",
      example: 3600,
      minimum: 1,
    }),
  })
  .openapi({
    description: "이메일 발송 응답",
    example: {
      message: "인증 이메일이 발송되었습니다",
      email: "user@example.com",
      expiresIn: 3600,
    },
  });

// Error schemas
export const ErrorResponseSchema = z
  .object({
    error: z.string().min(1).openapi({
      description: "에러 타입",
      example: "VALIDATION_ERROR",
    }),
    message: z.string().min(1).openapi({
      description: "에러 메시지",
      example: "입력값이 유효하지 않습니다",
    }),
    statusCode: z.number().int().min(100).max(599).openapi({
      description: "HTTP 상태 코드",
      example: 400,
      minimum: 100,
      maximum: 599,
    }),
  })
  .openapi({
    description: "에러 응답",
    example: {
      error: "VALIDATION_ERROR",
      message: "입력값이 유효하지 않습니다",
      statusCode: 400,
    },
  });

// Request schemas
export const EmailSignupRequestSchema = z
  .object({
    email: z.string().email().openapi({
      description: "회원가입할 이메일 주소",
      example: "user@example.com",
    }),
  })
  .openapi({
    description: "이메일 회원가입 요청",
    example: {
      email: "user@example.com",
    },
  });

export const EmailSigninRequestSchema = z
  .object({
    email: z.string().email().openapi({
      description: "로그인할 이메일 주소",
      example: "user@example.com",
    }),
  })
  .openapi({
    description: "이메일 로그인 요청",
    example: {
      email: "user@example.com",
    },
  });

export const KakaoSigninRequestSchema = z
  .object({
    code: z.string().min(1).openapi({
      description: "카카오 OAuth 인가 코드",
      example: "1a2b3c4d5e6f7g8h9i0j",
    }),
    redirectUri: z.string().url().optional().openapi({
      description: "카카오 OAuth 리다이렉트 URI",
      example: "https://lolog.site/auth/kakao/callback",
    }),
  })
  .openapi({
    description: "카카오 로그인 요청",
    example: {
      code: "1a2b3c4d5e6f7g8h9i0j",
      redirectUri: "https://lolog.site/auth/kakao/callback",
    },
  });

export const EmailVerifyRequestSchema = z
  .object({
    token: z.string().min(1).openapi({
      description: "이메일 인증 토큰",
      example: "abc123def456ghi789",
    }),
  })
  .openapi({
    description: "이메일 인증 요청",
    example: {
      token: "abc123def456ghi789",
    },
  });

// Auth cookie schema
export const SessionCookieSchema = z
  .string()
  .min(1)
  .openapi({
    param: {
      name: "session",
      in: "cookie",
    },
    description: "세션 쿠키",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  });

export const SignoutResponseSchema = z
  .object({
    message: z.string().min(1).openapi({
      description: "로그아웃 완료 메시지",
      example: "로그아웃되었습니다",
    }),
  })
  .openapi({
    description: "로그아웃 응답",
    example: {
      message: "로그아웃되었습니다",
    },
  });
