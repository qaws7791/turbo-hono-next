import { createResponseDto } from "@/common/utils/dto";
import { createRoute, z } from "@hono/zod-openapi";
import status from "http-status";

const TAG = ["sido"];

export const getSidoList = createRoute({
  summary: "시도 목록 조회",
  method: "get",
  path: "/",
  tags: TAG,
  responses: {
    [status.OK]: {
      description: "시도 목록 조회 성공",
      content: {
        "application/json": {
          schema: createResponseDto(
            z
              .object({
                id: z.number(),
                name: z.string(),
              })
              .array(),
          ),
        },
      },
    },
  },
});

export const getSigunguList = createRoute({
  summary: "시군구 목록 조회",
  method: "get",
  path: "/{sidoId}/sigungu",
  tags: TAG,
  request: {
    params: z.object({
      sidoId: z.coerce.number().positive("시도 ID는 양수여야 합니다."),
    }),
  },
  responses: {
    [status.OK]: {
      description: "시군구 목록 조회 성공",
      content: {
        "application/json": {
          schema: createResponseDto(
            z
              .object({
                id: z.number(),
                name: z.string(),
                sidoId: z.number(),
              })
              .array(),
          ),
        },
      },
    },
  },
});
