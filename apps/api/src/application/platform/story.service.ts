import { HTTPError } from "@/common/errors/http-error";
import { DI_SYMBOLS } from "@/containers/di-symbols";
import { CreatorRepository } from "@/infrastructure/database/repositories/creator.repository";
import { StoryRepository } from "@/infrastructure/database/repositories/story.repository";
import { storiesStatusEnum } from "@/infrastructure/database/schema";
import { StoryInsert } from "@/infrastructure/database/types";
import { validateEditorJSONContent } from "@repo/tiptap-config";
import status from "http-status";
import { inject, injectable } from "inversify";
@injectable()
export class StoryService {
  constructor(
    @inject(DI_SYMBOLS.storyRepository)
    private storyRepository: StoryRepository,
    @inject(DI_SYMBOLS.creatorRepository)
    private creatorRepository: CreatorRepository, // Assuming creatorRepository is similar to storyRepository
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

    const creator = await this.creatorRepository.findByUserId(data.authorId);
    if (!creator) {
      throw new HTTPError(
        {
          message: "Creator not found",
        },
        status.NOT_FOUND,
      );
    }
    return this.storyRepository.createStory({
      ...data,
      contentText: data.contentText || "", // Ensure contentText is provided
      authorId: creator.id, // Use creator's ID instead of user ID
    });
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
