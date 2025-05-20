import { StoryRepository } from "@/db/repositories/story.repository";
import { storiesStatusEnum } from "@/db/schema";
import { StoryInsert } from "@/db/types";
import { HTTPError } from "@/errors/http-error";
import { validateEditorJSONContent } from "@repo/tiptap-config";
import status from "http-status";
import { inject, injectable } from "inversify";
@injectable()
export class StoryService {
  constructor(
    @inject(StoryRepository) private storyRepository: StoryRepository,
  ) {}

  async createStory(data: StoryInsert) {
    if (!this.validateStoryContent(data.content)) {
      throw new HTTPError(
        {
          message: "Invalid story content",
        },
        status.BAD_REQUEST,
      );
    }
    return this.storyRepository.createStory(data);
  }

  async updateStory(id: number, data: Partial<StoryInsert>) {
    if (!this.validateStoryContent(data.content)) {
      throw new HTTPError(
        {
          message: "Invalid story content",
        },
        status.BAD_REQUEST,
      );
    }
    return this.storyRepository.updateStory(id, data);
  }

  async deleteStory(id: number) {
    return this.storyRepository.softDeleteStory(id);
  }

  async getStoryById(id: number) {
    return this.storyRepository.getStoryById(id);
  }

  async getMyStories(
    authorId: number,
    options?: { limit?: number; offset?: number },
  ) {
    return this.storyRepository.getStoriesByAuthor(authorId, options);
  }

  async getAllStories(options?: {
    status?: (typeof storiesStatusEnum.enumValues)[number];
    limit?: number;
    offset?: number;
  }) {
    return this.storyRepository.getAllStories(options);
  }

  async searchStories(params: {
    keyword?: string;
    regionId?: number;
    categoryId?: number;
    status?: (typeof storiesStatusEnum.enumValues)[number];
    limit?: number;
    offset?: number;
  }) {
    return this.storyRepository.searchStories(params);
  }

  async getStoryDetail(id: number) {
    return this.storyRepository.getStoryDetail(id);
  }
  private validateStoryContent(content: unknown) {
    try {
      const data = JSON.parse(content as string);
      return validateEditorJSONContent(data);
    } catch {
      return false;
    }
  }
}
