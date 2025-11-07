import { createRoute } from "@hono/zod-openapi";

import { AuthSchemas } from "./schema";

export const loginWithEmailRoute = createRoute({
  tags: ["auth"],
  method: "post",
  path: "/auth/login",
  summary: "이메일과 비밀번호로 로그인합니다",
  description: `세션 쿠키를 발급해 인증된 상태를 시작합니다.

- **입력 검증**: AuthSchemas.EmailLoginRequestSchema 규격을 지키지 않으면
  400을 반환합니다. 이는 잘못된 요청으로 인한 자원 낭비를 막기 위함입니다.
- **보안 정책**: 잘못된 인증 정보가 반복되면 계정 보호를 위해 제한이
  적용됩니다.
- **세션 관리**: 기존 세션이 있으면 새로운 세션으로 갱신해 동시 로그인
  충돌을 방지합니다.`,
  request: {
    body: {
      content: {
        "application/json": {
          schema: AuthSchemas.EmailLoginRequestSchema,
        },
      },
      description: "이메일과 비밀번호를 전달합니다.",
    },
  },
  responses: {
    200: {
      description: "로그인에 성공했습니다.",
      content: {
        "application/json": {
          schema: AuthSchemas.SessionResponseSchema,
        },
      },
      headers: {
        "Set-Cookie": {
          description: "세션 쿠키 값입니다.",
          schema: {
            type: "string",
            examples: [
              "session=sessionTokenValue; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800",
            ],
          },
        },
      },
    },
    default: {
      description: "에러 응답",
      content: {
        "application/json": {
          schema: AuthSchemas.ErrorResponseSchema,
        },
      },
    },
  },
});

export const signupRoute = createRoute({
  tags: ["auth"],
  method: "post",
  path: "/auth/signup",
  summary: "이메일로 신규 사용자를 등록합니다",
  description: `사용자를 생성하고 성공 시 즉시 로그인 세션을 발급합니다.

- **중복 방지**: 이미 등록된 이메일이면 409를 반환해 계정 충돌을 방지합니다.
- **입력 검증**: AuthSchemas.EmailSignupRequestSchema 요구 사항을 충족하지
  않으면 400을 반환합니다. 안전한 비밀번호 정책 유지를 위한 조치입니다.
- **자동 로그인**: 가입 직후 세션을 발급해 학습 온보딩 경험을 단순화합니다.`,
  request: {
    body: {
      content: {
        "application/json": {
          schema: AuthSchemas.EmailSignupRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "회원가입이 완료되었습니다.",
      content: {
        "application/json": {
          schema: AuthSchemas.SessionResponseSchema,
        },
      },
    },
    default: {
      description: "에러 응답",
      content: {
        "application/json": {
          schema: AuthSchemas.ErrorResponseSchema,
        },
      },
    },
  },
});

export const changePasswordRoute = createRoute({
  tags: ["auth"],
  method: "put",
  path: "/auth/change-password",
  summary: "현재 비밀번호를 검증하고 새 비밀번호로 변경합니다",
  description: `기존 자격 증명을 확인한 뒤 새 비밀번호를 저장합니다.

- **본인 확인**: 현재 비밀번호가 맞지 않으면 401을 반환해 계정 무단 변경을
  차단합니다.
- **입력 검증**: AuthSchemas.ChangePasswordRequestSchema 요건을 충족하지
  않으면 400을 반환합니다. 이는 비밀번호 품질을 보장하기 위한 정책입니다.
- **세션 유지**: 성공 시 기존 세션을 유지해 학습 진행이 중단되지 않도록
  합니다.`,
  request: {
    body: {
      content: {
        "application/json": {
          schema: AuthSchemas.ChangePasswordRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "비밀번호를 변경했습니다.",
      content: {
        "application/json": {
          schema: AuthSchemas.SuccessResponseSchema,
        },
      },
    },
    default: {
      description: "에러 응답",
      content: {
        "application/json": {
          schema: AuthSchemas.ErrorResponseSchema,
        },
      },
    },
  },
  security: [
    {
      cookieAuth: [],
    },
  ],
});

export const logoutRoute = createRoute({
  tags: ["auth"],
  method: "post",
  path: "/auth/logout",
  summary: "세션 쿠키를 제거해 로그아웃합니다",
  description: `현재 세션을 만료시키고 클라이언트 쿠키를 제거합니다.

- **쿠키 정리**: 서버와 클라이언트 쿠키를 함께 제거해 잔여 세션 노출을
  막습니다.
- **다중 기기**: 요청한 세션만 종료되며 다른 기기 세션은 유지됩니다. 이는
  예기치 않은 세션 해제를 방지하기 위한 설계입니다.
- **보안성**: 명시적 로그아웃 요청으로 탈취된 세션을 즉시 무효화할 수
  있습니다.`,
  responses: {
    200: {
      description: "로그아웃에 성공했습니다.",
      content: {
        "application/json": {
          schema: AuthSchemas.SuccessResponseSchema,
        },
      },
    },
    default: {
      description: "에러 응답",
      content: {
        "application/json": {
          schema: AuthSchemas.ErrorResponseSchema,
        },
      },
    },
  },
  security: [
    {
      cookieAuth: [],
    },
  ],
});

export const currentUserRoute = createRoute({
  tags: ["auth"],
  method: "get",
  path: "/auth/me",
  summary: "현재 로그인한 사용자의 정보를 조회합니다",
  description: `세션 쿠키를 검사해 인증된 사용자의 프로필을 반환합니다.

- **세션 필수**: cookieAuth 보안 스키마가 없으면 401을 반환합니다. 이는
  민감 정보 노출을 막기 위한 최소 조건입니다.
- **캐시 주의**: 사용자 상태가 자주 변하므로 중간 캐시를 피하고 직접
  호출해야 합니다.
- **동시성**: 최신 정보를 위해 DB에서 즉시 조회하며, 지연된 복제를
  사용하는 환경에서는 일시적인 지연이 있을 수 있습니다.`,
  responses: {
    200: {
      description: "현재 로그인한 사용자의 정보를 반환합니다.",
      content: {
        "application/json": {
          schema: AuthSchemas.UserResponseSchema,
        },
      },
    },
    default: {
      description: "에러 응답",
      content: {
        "application/json": {
          schema: AuthSchemas.ErrorResponseSchema,
        },
      },
    },
  },
  security: [
    {
      cookieAuth: [],
    },
  ],
});

export const authRoutes = [
  loginWithEmailRoute,
  signupRoute,
  changePasswordRoute,
  logoutRoute,
  currentUserRoute,
] as const;
