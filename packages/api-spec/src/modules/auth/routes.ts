import { createRoute } from "@hono/zod-openapi";
import { AuthSchemas } from "./schema";

export const loginWithEmailRoute = createRoute({
  tags: ["Auth"],
  method: "post",
  path: "/auth/login",
  summary: "Login with email and password",
  request: {
    body: {
      content: {
        "application/json": {
          schema: AuthSchemas.EmailLoginRequestSchema,
        },
      },
      description: "Login with email and password",
    },
  },
  responses: {
    200: {
      description: "Login successful",
      content: {
        "application/json": {
          schema: AuthSchemas.SessionResponseSchema,
        },
      },
      headers: {
        "Set-Cookie": {
          description: "Session cookie",
          schema: {
            type: "string",
            example:
              "session=sessionTokenValue; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800",
          },
        },
      },
    },
    400: {
      description: "Invalid input",
      content: {
        "application/json": {
          schema: AuthSchemas.ErrorResponseSchema,
        },
      },
    },
    401: {
      description: "Invalid credentials",
      content: {
        "application/json": {
          schema: AuthSchemas.ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: AuthSchemas.ErrorResponseSchema,
        },
      },
    },
  },
});

export const signupRoute = createRoute({
  tags: ["Auth"],
  method: "post",
  path: "/auth/signup",
  summary: "Register with email and password",
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
      description: "Registration successful",
      content: {
        "application/json": {
          schema: AuthSchemas.SessionResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid input",
      content: {
        "application/json": {
          schema: AuthSchemas.ErrorResponseSchema,
        },
      },
    },
    409: {
      description: "User already exists",
      content: {
        "application/json": {
          schema: AuthSchemas.ErrorResponseSchema,
        },
      },
    },
  },
});

export const changePasswordRoute = createRoute({
  tags: ["Auth"],
  method: "put",
  path: "/auth/change-password",
  summary: "Change user password",
  description:
    "Change the current user's password by providing current and new password",
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
      description: "Password changed successfully",
      content: {
        "application/json": {
          schema: AuthSchemas.SuccessResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid request data",
      content: {
        "application/json": {
          schema: AuthSchemas.ErrorResponseSchema,
        },
      },
    },
    401: {
      description: "Current password is incorrect",
      content: {
        "application/json": {
          schema: AuthSchemas.ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
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
  tags: ["Auth"],
  method: "post",
  path: "/auth/logout",
  summary: "Logout user",
  responses: {
    200: {
      description: "Logout successful",
      content: {
        "application/json": {
          schema: AuthSchemas.SuccessResponseSchema,
        },
      },
    },
    500: {
      description: "Logout failed",
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
  tags: ["Auth"],
  method: "get",
  path: "/auth/me",
  summary: "Get current user information",
  responses: {
    200: {
      description: "Current user information",
      content: {
        "application/json": {
          schema: AuthSchemas.UserResponseSchema,
        },
      },
    },
    401: {
      description: "Authentication required",
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
