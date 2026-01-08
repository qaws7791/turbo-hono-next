import { useSuspenseQuery } from "@tanstack/react-query";

import { selectNextQueue } from "../model/plans.selectors";
import { plansQueries } from "../plans.queries";

import { usePlanActions } from "./use-plan-actions";

import type {
  PlanDetailQueueItem,
  PlanDetailSpace,
  PlanSourceMaterial,
  PlanWithDerived,
} from "../model";
import type { PlanActions } from "./use-plan-actions";

import { spacesQueries } from "~/domains/spaces";

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
 * - 데이터 페칭 (space, plan)
 * - 파생 상태 계산 (nextQueue, nextSession, canStartSession)
 * - 액션 핸들러 (pause, resume, archive)
 */
export function usePlanDetail(
  spaceId: string,
  planId: string,
): PlanDetailModel {
  const { data: spaceData } = useSuspenseQuery(spacesQueries.detail(spaceId));
  const { data: plan } = useSuspenseQuery(plansQueries.detail(planId));

  // spaceId 검증
  if (plan.spaceId !== spaceId) {
    throw new Response("Not Found", { status: 404 });
  }

  const actions = usePlanActions(spaceId);

  const nextQueue = selectNextQueue(plan);
  const nextSession = nextQueue[0];
  const canStartSession = plan.status === "active" && Boolean(nextSession);

  return {
    space: { id: spaceData.id, name: spaceData.name },
    plan,
    sourceMaterials: [],
    nextSession,
    canStartSession,
    actions,
  };
}
