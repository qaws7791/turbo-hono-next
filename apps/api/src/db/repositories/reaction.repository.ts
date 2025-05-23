import { reactions } from "@/db/schema";
import { type DbClient, ReactionInsert, ReactionSelect } from "@/db/types";
import { DatabaseError } from "@/errors/database-error";
import { and, eq } from "drizzle-orm";
import status from "http-status";
import { inject, injectable } from "inversify";

@injectable()
export class ReactionRepository {
  constructor(
    @inject("db")
    private db: DbClient,
  ) {}

  // 반응 추가 (스토리+유저 조합은 unique)
  async addReaction(data: ReactionInsert): Promise<ReactionSelect> {
    try {
      const [reaction] = await this.db
        .insert(reactions)
        .values(data)
        .returning();
      if (!reaction)
        throw new DatabaseError(
          "반응 추가에 실패했습니다.",
          status.INTERNAL_SERVER_ERROR,
        );
      return reaction;
    } catch (err: any) {
      // unique 제약 위반 등
      throw new DatabaseError(
        err.message || "반응 추가 중 오류 발생",
        status.BAD_REQUEST,
      );
    }
  }

  // 반응 취소 (삭제)
  async removeReaction(storyId: number, userId: number): Promise<number> {
    const result = await this.db
      .delete(reactions)
      .where(and(eq(reactions.storyId, storyId), eq(reactions.userId, userId)));
    return result.rowCount || 0;
  }

  // 특정 스토리에 대한 모든 반응 조회
  async getReactionsByStory(storyId: number): Promise<ReactionSelect[]> {
    return this.db.query.reactions.findMany({
      where: eq(reactions.storyId, storyId),
    });
  }

  // 특정 유저가 특정 스토리에 남긴 반응 조회
  async getUserReaction(
    storyId: number,
    userId: number,
  ): Promise<ReactionSelect | undefined> {
    return this.db.query.reactions.findFirst({
      where: and(eq(reactions.storyId, storyId), eq(reactions.userId, userId)),
    });
  }
}
