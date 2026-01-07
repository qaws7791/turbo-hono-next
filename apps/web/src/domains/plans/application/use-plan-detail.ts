import { useSuspenseQuery } from "@tanstack/react-query";

import { plansQueries } from "../plans.queries";

import { usePlanActions } from "./use-plan-actions";

import type {
  PlanDetailQueueItem,
  PlanDetailSpace,
  PlanSourceMaterial,
  PlanWithDerived,
} from "../model";
import type { PlanActions } from "./use-plan-actions";

export type PlanDetailModel = {
  space: PlanDetailSpace;
  plan: PlanWithDerived;
  sourceMaterials: Array<PlanSourceMaterial>;
  nextSession: PlanDetailQueueItem | undefined;
  canStartSession: boolean;
  actions: PlanActions;
};

/**
 * 플랜 상세 페이지의 데이터와 파생 상태를 관리하는 훅
 *
 * - 데이터 페칭 (space, plan, sourceMaterials, nextQueue)
 * - 파생 상태 계산 (nextSession, canStartSession)
 * - 액션 핸들러 (pause, resume, archive)
 */
export function usePlanDetail(
  spaceId: string,
  planId: string,
): PlanDetailModel {
  const {
    data: { space, plan, nextQueue, sourceMaterials },
  } = useSuspenseQuery(plansQueries.detailPage(spaceId, planId));

  const actions = usePlanActions(spaceId);

  const nextSession = nextQueue[0];
  const canStartSession = plan.status === "active" && Boolean(nextSession);

  return {
    space,
    plan,
    sourceMaterials,
    nextSession,
    canStartSession,
    actions,
  };
}
