import { createOpenAPI } from "@/api/helpers/openapi";
import { HTTPError } from "@/common/errors/http-error";
import { APIResponse, Pagination } from "@/common/utils/response";
import { container } from "@/containers";
import { DI_SYMBOLS } from "@/containers/di-symbols";
import { IStoryQueryService } from "@/domain/service/story/story-query.service.interface";
import { IStoryService } from "@/domain/service/story/story.service.interface";
import { IUserService } from "@/domain/service/user/user.service.interface";
import { validateEditorJSONContent } from "@repo/tiptap-config";
import status from "http-status";
import * as routes from "./stories.routes";

const platformStories = createOpenAPI();

const storyService = container.get<IStoryService>(DI_SYMBOLS.StoryService);
const storyQueryService = container.get<IStoryQueryService>(
  DI_SYMBOLS.StoryQueryService,
);
const userService = container.get<IUserService>(DI_SYMBOLS.UserService);

platformStories.openapi(routes.createStory, async (c) => {
  const user = c.get("user");
  if (!user) {
    throw new HTTPError(
      {
        message: "사용자 정보가 없습니다.",
      },
      401,
    );
  }
  const json = await c.req.valid("json");
  // content가 필수이므로 undefined일 경우 빈 객체로 대체

  const tiptapJSONContent = JSON.parse(json.content);
  if (
    !tiptapJSONContent ||
    typeof tiptapJSONContent !== "object" ||
    validateEditorJSONContent(tiptapJSONContent) !== true
  ) {
    throw new HTTPError(
      {
        message: "잘못된 콘텐츠 형식입니다.",
      },
      400,
    );
  }

  const result = await storyService.createStory(user.id, {
    title: json.title,
    content: json.content,
    coverImageUrl: json.coverImageUrl,
  });
  return c.json({ id: result.id }, 201);
});

platformStories.openapi(routes.updateStory, async (c) => {
  const user = c.get("user");
  const { id } = c.req.valid("param");
  const json = await c.req.valid("json");
  await storyService.updateStory(user.id, id, json);
  return c.json({ message: "스토리 수정 성공" });
});

platformStories.openapi(routes.deleteStory, async (c) => {
  const user = c.get("user");
  const { id } = c.req.valid("param");
  await storyService.deleteStory(user.id, id);
  return c.json({ message: "스토리 삭제 성공" });
});

platformStories.openapi(routes.getStory, async (c) => {
  const { id } = c.req.valid("param");
  const story = await storyQueryService.getStoryDetailById(id);

  return c.json(APIResponse.success(story), 200);
});

platformStories.openapi(routes.listStories, async (c) => {
  const query = c.req.valid("query");
  const stories = await storyQueryService.listStories(query);
  const pagination: Pagination = {
    currentPage: stories.currentPage,
    itemsPerPage: stories.itemsPerPage,
    nextPage: stories.nextPage,
    prevPage: stories.prevPage,
    totalItems: stories.totalItems,
    totalPages: stories.totalPages,
  };
  return c.json(APIResponse.pagination(stories.items, pagination, status.OK));
});

export default platformStories;
