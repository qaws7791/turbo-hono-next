import { createRoute } from "@hono/zod-openapi";
import { ErrorResponseSchema } from "../../auth/api/auth.schema";
import { authMiddleware } from "../../auth/middleware/auth.middleware";
import {
  BecomeCreatorRequestSchema,
  PublicUserProfileSchema,
  UpdateUserRequestSchema,
  UserIdParamsSchema,
  UserProfileSchema,
} from "./users.schema";

export const viewMyProfile = createRoute({
  method: "get",
  path: "/users/me",
  tags: ["Users"],
  summary: "View My Profile",
  middleware: [authMiddleware],
  responses: {
    200: {
      content: {
        "application/json": {
          schema: UserProfileSchema,
        },
      },
      description: "Successful Response",
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

export const updateMyProfile = createRoute({
  method: "patch",
  path: "/users/me",
  tags: ["Users"],
  summary: "Update My Profile",
  middleware: [authMiddleware],
  request: {
    body: {
      content: {
        "application/json": {
          schema: UpdateUserRequestSchema,
        },
      },
      description: "Update User Profile Request",
    },
  },
  responses: {
    204: {
      description: "Successful Response",
    },
    400: {
      description: "Bad Request",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

export const becomeCreator = createRoute({
  method: "patch",
  path: "/users/become-creator",
  tags: ["Users"],
  summary: "Become Creator",
  middleware: [authMiddleware],
  request: {
    body: {
      content: {
        "application/json": {
          schema: BecomeCreatorRequestSchema,
        },
      },
    },
  },
  responses: {
    204: {
      description: "Successful Response",
    },
    400: {
      description: "Bad Request",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    403: {
      description: "Forbidden",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

export const viewUserProfile = createRoute({
  method: "get",
  path: "/users/{id}",
  tags: ["Users"],
  summary: "View User Profile",
  request: {
    params: UserIdParamsSchema,
  },
  responses: {
    200: {
      description: "Successful Response",
      content: {
        "application/json": {
          schema: PublicUserProfileSchema,
        },
      },
    },
    404: {
      description: "User Not Found",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

export const followUser = createRoute({
  method: "post",
  path: "/users/{id}/follow",
  tags: ["Users"],
  summary: "Follow User",
  middleware: [authMiddleware],
  request: {
    params: UserIdParamsSchema,
  },
  responses: {
    204: {
      description: "Successful Response",
    },
    400: {
      description: "Bad Request",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    404: {
      description: "User Not Found",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    409: {
      description: "Already Following",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

export const unfollowUser = createRoute({
  method: "delete",
  path: "/users/{id}/follow",
  tags: ["Users"],
  summary: "Unfollow User",
  middleware: [authMiddleware],
  request: {
    params: UserIdParamsSchema,
  },
  responses: {
    204: {
      description: "Successful Response",
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    404: {
      description: "Forbidden",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});
