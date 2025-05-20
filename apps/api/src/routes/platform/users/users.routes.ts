import { isUser } from "@/middlewares/role.middleware";
import { createRoute, z } from "@hono/zod-openapi";
import status from "http-status";

const TAG = ["Users"];

/**
 * 내 정보 조회
 */
export const getMyInfo = createRoute({
  summary: "내 정보 조회",
  method: "get",
  path: "/me",
  tags: TAG,
  middleware: [isUser],
  responses: {
    [status.OK]: {
      description: "내 정보 조회 성공",
      content: {
        "application/json": {
          schema: z.object({
            id: z.number(),
            name: z.string(),
            email: z.string(),
            emailVerified: z.string().datetime().nullable(),
            profileImageUrl: z.string().nullable(),
            role: z.enum(["user", "creator"]),
            status: z.enum(["active", "inactive", "suspended"]),
            createdAt: z.string().datetime(),
            updatedAt: z.string().datetime(),
          }),
        },
      },
    },
    [status.UNAUTHORIZED]: {
      description: "로그인이 필요합니다.",
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

/**
 * 내 정보 수정
 */
export const updateMyInfo = createRoute({
  summary: "내 정보 수정",
  method: "patch",
  path: "/me",
  tags: TAG,
  middleware: [isUser],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            name: z.string().optional(),
            profileImageUrl: z.string().optional(),
          }),
        },
      },
    },
  },
  responses: {
    [status.NO_CONTENT]: {
      description: "내 정보 수정 성공",
    },
  },
});
