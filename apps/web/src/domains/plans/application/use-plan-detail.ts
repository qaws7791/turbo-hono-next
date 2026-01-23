import { useSuspenseQuery } from "@tanstack/react-query";

import { selectNextQueue } from "../model/plans.selectors";
import { plansQueries } from "../plans.queries";

import { usePlanActions } from "./use-plan-actions";

import type {
  PlanDetailQueueItem,
  PlanSourceMaterial,
  PlanWithDerived,
} from "../model";
import type { PlanActions } from "./use-plan-actions";

export type PlanDetailModel = {
  plan: PlanWithDerived;
  sourceMaterials: Array<PlanSourceMaterial>;
  nextSession: PlanDetailQueueItem | undefined;
  canStartSession: boolean;
  actions: PlanActions;
};

/**
 * 플랜 상세 페이지의 데이터와 파생 상태를 관리하는 훅
 *
 * - 데이터 페칭 (plan)
 * - 파생 상태 계산 (nextQueue, nextSession, canStartSession)
 * - 액션 핸들러 (pause, resume, archive)
 */
export function usePlanDetail(planId: string): PlanDetailModel {
  const { data: plan } = useSuspenseQuery(plansQueries.detail(planId));

  const actions = usePlanActions();

  const nextQueue = selectNextQueue(plan);
  const nextSession = nextQueue[0];
  const canStartSession =
    plan.generationStatus === "ready" &&
    plan.status === "active" &&
    Boolean(nextSession);

  return {
    plan,
    sourceMaterials: plan.materials,
    nextSession,
    canStartSession,
    actions,
  };
}
