import { createRoute, z } from "@hono/zod-openapi";
import status from "http-status";

const TAG = ["stories"];

// --- Story Schemas ---
const storyBaseSchema = z.object({
  title: z.string().max(255),
  content: z.any(), // 실제로는 JSON 구조, 프론트와 협의 필요
  regionId: z.number().optional(),
  categoryId: z.number().optional(),
});

const storyCreateSchema = storyBaseSchema.extend({
  authorId: z.number(), // 실제 서비스에서는 인증된 유저에서 추출
});

const storyUpdateSchema = storyBaseSchema.partial();

const storyIdParam = z.object({ id: z.number() });

// --- Reaction Schemas ---
const reactionBaseSchema = z.object({
  storyId: z.number(),
  userId: z.number(), // 실제 서비스에서는 인증된 유저에서 추출
  reactionType: z.enum(["like", "heart", "clap", "fire", "idea"]),
});

// --- Story Routes ---
export const createStory = createRoute({
  summary: "스토리 생성",
  method: "post",
  path: "/",
  tags: TAG,
  request: {
    body: {
      content: {
        "application/json": { schema: storyCreateSchema },
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
  },
});

export const updateStory = createRoute({
  summary: "스토리 수정",
  method: "put",
  path: "/{id}",
  tags: TAG,
  request: {
    params: storyIdParam,
    body: {
      content: {
        "application/json": { schema: storyUpdateSchema },
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
  request: { params: storyIdParam },
  responses: {
    [status.OK]: { description: "스토리 삭제 성공" },
  },
});

export const getStory = createRoute({
  summary: "스토리 단건 조회",
  method: "get",
  path: "/{id}",
  tags: TAG,
  request: { params: storyIdParam },
  responses: {
    [status.OK]: {
      description: "스토리 조회 성공",
      content: {
        "application/json": {
          schema: storyBaseSchema.extend({
            id: z.number(),
            authorId: z.number(),
            contentText: z.string(),
          }),
        },
      },
    },
    [status.NOT_FOUND]: { description: "스토리 없음" },
  },
});

export const listStories = createRoute({
  summary: "스토리 목록 조회",
  method: "get",
  path: "/",
  tags: TAG,
  request: {
    query: z.object({
      status: z.string().optional(),
      authorId: z.number().optional(),
      limit: z.number().optional(),
      offset: z.number().optional(),
    }),
  },
  responses: {
    [status.OK]: {
      description: "스토리 목록 조회 성공",
      content: {
        "application/json": {
          schema: z.array(
            storyBaseSchema.extend({
              id: z.number(),
              authorId: z.number(),
              contentText: z.string(),
            }),
          ),
        },
      },
    },
  },
});

export const searchStories = createRoute({
  summary: "스토리 검색",
  method: "get",
  path: "/search",
  tags: TAG,
  request: {
    query: z.object({
      keyword: z.string().optional(),
      regionId: z.number().optional(),
      categoryId: z.number().optional(),
      status: z.string().optional(),
      limit: z.number().optional(),
      offset: z.number().optional(),
    }),
  },
  responses: {
    [status.OK]: {
      description: "스토리 검색 성공",
      content: {
        "application/json": {
          schema: z.array(
            storyBaseSchema.extend({
              id: z.number(),
              authorId: z.number(),
              contentText: z.string(),
            }),
          ),
        },
      },
    },
  },
});

// --- Reaction Routes ---
export const addReaction = createRoute({
  summary: "스토리 반응 추가",
  method: "post",
  path: "/{id}/reaction",
  tags: TAG,
  request: {
    params: storyIdParam,
    body: {
      content: {
        "application/json": {
          schema: reactionBaseSchema.pick({ reactionType: true, userId: true }),
        },
      },
    },
  },
  responses: {
    [status.CREATED]: { description: "반응 추가 성공" },
    [status.BAD_REQUEST]: { description: "반응 추가 실패" },
  },
});

export const removeReaction = createRoute({
  summary: "스토리 반응 삭제",
  method: "delete",
  path: "/{id}/reaction",
  tags: TAG,
  request: {
    params: storyIdParam,
    query: z.object({ userId: z.number() }),
  },
  responses: {
    [status.OK]: { description: "반응 삭제 성공" },
  },
});

export const getReactions = createRoute({
  summary: "스토리 반응 목록 조회",
  method: "get",
  path: "/{id}/reactions",
  tags: TAG,
  request: { params: storyIdParam },
  responses: {
    [status.OK]: {
      description: "반응 목록 조회 성공",
      content: {
        "application/json": {
          schema: z.array(reactionBaseSchema.extend({ id: z.number() })),
        },
      },
    },
  },
});
