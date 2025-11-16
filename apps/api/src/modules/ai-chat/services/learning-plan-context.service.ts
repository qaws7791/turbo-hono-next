import { learningPlanRepository } from "../../learning-plan/repositories/learning-plan.repository";
import { learningModuleQueryService } from "../../learning-plan/services/learning-module.query.service";
import { learningPlanQueryService } from "../../learning-plan/services/learning-plan.query.service";
import { AIChatErrors } from "../errors";
import { formatPlanContext } from "../helpers/prompt.helper";

import type { DatabaseTransaction } from "../../../lib/transaction.helper";
import type { LearningPlanDetailResponse } from "../../learning-plan/services/learning-plan.query.service";
import type { ModuleSummary } from "../helpers/prompt.helper";

export interface LearningPlanContextResult {
  learningPlan: LearningPlanDetailResponse;
  modules: Array<ModuleSummary>;
  planContext: string;
}

/**
 * Service for building learning plan context for AI chat
 */
export class LearningPlanContextService {
  /**
   * Build complete learning plan context for AI prompts
   */
  async buildContext(
    learningPlanId: number,
    userId: string,
    tx?: DatabaseTransaction,
  ): Promise<LearningPlanContextResult> {
    // Get learning plan data
    const learningPlanData = await learningPlanRepository.findById(
      learningPlanId,
      tx,
    );

    if (!learningPlanData) {
      throw AIChatErrors.learningPlanNotFound();
    }

    // Fetch plan details and modules in parallel
    const [learningPlan, modules] = await Promise.all([
      learningPlanQueryService.getLearningPlan({
        publicId: learningPlanData.publicId,
        userId,
      }),
      learningModuleQueryService.listModulesByPlan(
        learningPlanData.publicId,
        userId,
      ),
    ]);

    return {
      learningPlan,
      modules,
      planContext: formatPlanContext(learningPlan, modules),
    };
  }
}

export const learningPlanContextService = new LearningPlanContextService();
