import { createOpenAPI } from "@/api/helpers/openapi";
import { ReactionService } from "@/application/platform/reaction.service";
import { StoryService } from "@/application/platform/story.service";
import { container } from "@/containers";
import { DI_SYMBOLS } from "@/containers/di-symbols";
import * as routes from "./stories.routes";

const platformStories = createOpenAPI();

const storyService = container.get<StoryService>(DI_SYMBOLS.storyService);
const reactionService = container.get<ReactionService>(
  DI_SYMBOLS.reactionService,
);

platformStories.openapi(routes.createStory, async (c) => {
  const json = await c.req.valid("json");
  // content가 필수이므로 undefined일 경우 빈 객체로 대체
  const result = await storyService.createStory({
    ...json,
    content: json.content ?? {},
    contentText: "",
  });
  return c.json({ id: result.id }, 201);
});

platformStories.openapi(routes.updateStory, async (c) => {
  const { id } = c.req.valid("param");
  const json = await c.req.valid("json");
  await storyService.updateStory(id, json);
  return c.json({ message: "스토리 수정 성공" });
});

platformStories.openapi(routes.deleteStory, async (c) => {
  const { id } = c.req.valid("param");
  await storyService.deleteStory(id);
  return c.json({ message: "스토리 삭제 성공" });
});

platformStories.openapi(routes.getStory, async (c) => {
  const { id } = c.req.valid("param");
  const story = await storyService.getStoryById(id);
  if (!story) return c.json({ message: "스토리 없음" }, 404);
  return c.json(story);
});

platformStories.openapi(routes.listStories, async (c) => {
  const query = c.req.valid("query");
  // status가 string으로 들어오면 union 타입으로 변환
  const status =
    query.status && ["published", "hidden", "deleted"].includes(query.status)
      ? (query.status as "published" | "hidden" | "deleted")
      : undefined;
  const stories = await storyService.getAllStories({ ...query, status });
  return c.json(stories);
});

platformStories.openapi(routes.searchStories, async (c) => {
  const query = c.req.valid("query");
  const status =
    query.status && ["published", "hidden", "deleted"].includes(query.status)
      ? (query.status as "published" | "hidden" | "deleted")
      : undefined;
  const stories = await storyService.searchStories({ ...query, status });
  return c.json(stories);
});

// --- Reaction ---
platformStories.openapi(routes.addReaction, async (c) => {
  const { id } = c.req.valid("param");
  const json = await c.req.valid("json");
  // 실제 서비스에서는 userId를 인증 유저에서 추출해야 함
  await reactionService.addReaction({ ...json, storyId: id });
  return c.json({ message: "반응 추가 성공" }, 201);
});

platformStories.openapi(routes.removeReaction, async (c) => {
  const { id } = c.req.valid("param");
  const { userId } = c.req.valid("query");
  await reactionService.removeReaction(id, userId);
  return c.json({ message: "반응 삭제 성공" });
});

platformStories.openapi(routes.getReactions, async (c) => {
  const { id } = c.req.valid("param");
  const reactions = await reactionService.getReactionsByStory(id);
  return c.json(reactions);
});

export default platformStories;
