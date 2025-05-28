import { DI_SYMBOLS } from "@/containers/di-symbols";
import { ReactionRepository } from "@/infrastructure/database/repositories/reaction.repository";
import { ReactionInsert } from "@/infrastructure/database/types";
import { inject, injectable } from "inversify";

@injectable()
export class ReactionService {
  constructor(
    @inject(DI_SYMBOLS.reactionRepository)
    private reactionRepository: ReactionRepository,
  ) {}

  async addReaction(data: ReactionInsert) {
    return this.reactionRepository.addReaction(data);
  }

  async removeReaction(storyId: number, userId: number) {
    return this.reactionRepository.removeReaction(storyId, userId);
  }

  async getReactionsByStory(storyId: number) {
    return this.reactionRepository.getReactionsByStory(storyId);
  }

  async getUserReaction(storyId: number, userId: number) {
    return this.reactionRepository.getUserReaction(storyId, userId);
  }
}
