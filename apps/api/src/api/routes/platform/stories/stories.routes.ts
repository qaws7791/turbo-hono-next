import { isCreator, isUser } from "@/api/middlewares/role.middleware";
import { EntityIdParamDto, ErrorResponseDto, PaginationQueryDto } from "@/application/dtos/common.dto";
import { ReactionCreateOrUpdateBodySchema } from "@/application/dtos/platform/reaction.dto";
import {
  StoryCreateSchema,
  StoryDetailResponseSchema,
  StorySummaryResponseSchema,
  StoryUpdateSchema
} from "@/application/dtos/platform/story.dto";
import { createCursorPaginationResponseDto, createErrorResponseDto, createResponseDto } from "@/common/utils/dto";
import { createRoute, z } from "@hono/zod-openapi";
import status from "http-status";

const TAG = ["stories"];

// --- Story Routes ---
export const createStory = createRoute({
  summary: "스토리 생성",
  method: "post",
  path: "/",
  tags: TAG,
  middleware: [isCreator] as const,
  request: {
    body: {
      content: {
        "application/json": {
          schema: StoryCreateSchema,
          example: {
            title: "나의 첫 스토리",
            content:
              '{"type":"doc","content":[{"type":"paragraph","attrs":{"textAlign":null},"content":[{"type":"text","text":"내용입니다."}]}]}',
            coverImageUrl: "https://example.com/cover.jpg",
          },
        },
      },
    },
  },
  responses: {
    [status.CREATED]: {
      description: "스토리 생성 성공",
      content: {
        "application/json": { schema: z.object({ id: z.number() }) },
      },
    },
    [status.BAD_REQUEST]: {
      description: "스토리 생성 실패",
      content: {
        "application/json": { schema: ErrorResponseDto },
      },
    },
  },
});

export const updateStory = createRoute({
  summary: "스토리 수정",
  method: "put",
  path: "/{id}",
  tags: TAG,
  middleware: [isCreator] as const,
  request: {
    params: EntityIdParamDto,
    body: {
      content: {
        "application/json": { schema: StoryUpdateSchema },
      },
    },
  },
  responses: {
    [status.OK]: { description: "스토리 수정 성공" },
  },
});

export const deleteStory = createRoute({
  summary: "스토리 삭제",
  method: "delete",
  path: "/{id}",
  tags: TAG,
  middleware: [isCreator] as const,
  request: { params: EntityIdParamDto },
  responses: {
    [status.NO_CONTENT]: { description: "스토리 삭제 성공" },
  },
});

export const getStory = createRoute({
  summary: "스토리 단건 조회",
  method: "get",
  path: "/{id}",
  tags: TAG,
  request: { params: EntityIdParamDto },
  responses: {
    [status.OK]: {
      description: "스토리 조회 성공",
      content: {
        "application/json": {
          schema: createResponseDto(StoryDetailResponseSchema),
        },
      },
    },
    [status.NOT_FOUND]: {
      description: "스토리 없음",
      content: {
        "application/json": {
          schema: createErrorResponseDto(),
        },
      },
    },
  },
});

export const listStories = createRoute({
  summary: "스토리 목록 조회",
  method: "get",
  path: "/",
  tags: TAG,
  request: {
    query: PaginationQueryDto,
  },
  responses: {
    [status.OK]: {
      description: "스토리 목록 조회 성공",
      content: {
        "application/json": {
          schema:createCursorPaginationResponseDto(z.array(StorySummaryResponseSchema))
        },
      },
    },
  },
});

// --- Reaction Routes ---
export const updateReaction = createRoute({
  summary: "스토리 반응 추가 또는 수정",
  method: "put",
  path: "/{id}/reaction",
  tags: TAG,
  middleware: [isUser] as const,
  request: {
    params: EntityIdParamDto,
    body: {
      content: {
        "application/json": {
          schema: ReactionCreateOrUpdateBodySchema,
        },
      },
    },
  },
  responses: {
    [status.CREATED]: { description: "반응 추가 또는 수정 성공" },
    [status.BAD_REQUEST]: { description: "반응 추가 또는 수정 실패", content: { "application/json": { schema: createErrorResponseDto() } } },
  },
});
