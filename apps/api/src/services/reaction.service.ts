import { ReactionRepository } from "@/db/repositories/reaction.repository";
import { ReactionInsert } from "@/db/types";
import { inject, injectable } from "inversify";

@injectable()
export class ReactionService {
  constructor(
    @inject(ReactionRepository) private reactionRepository: ReactionRepository,
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
