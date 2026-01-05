import { queryOptions } from "@tanstack/react-query";

import {
  getActivePlanForSpaceUi,
  getPlanForUi,
  listPlansForUi,
} from "./application/plans";

import type { PlanDetailData, PlanWithDerived } from "./model/types";

import { getSpaceForUi } from "~/domains/spaces/application";

export const plansQueries = {
  all: () => ["plans"] as const,
  lists: () => [...plansQueries.all(), "list"] as const,
  details: () => [...plansQueries.all(), "detail"] as const,
  active: () => [...plansQueries.all(), "active"] as const,
  pages: () => [...plansQueries.all(), "page"] as const,

  listForSpace: (spaceId: string) =>
    queryOptions({
      queryKey: [...plansQueries.lists(), spaceId] as const,
      queryFn: (): Promise<Array<PlanWithDerived>> => listPlansForUi(spaceId),
      staleTime: 10_000,
      gcTime: 60_000,
    }),

  detail: (planId: string) =>
    queryOptions({
      queryKey: [...plansQueries.details(), planId] as const,
      queryFn: (): Promise<PlanWithDerived> => getPlanForUi(planId),
      staleTime: 5_000,
      gcTime: 60_000,
    }),

  activeForSpace: (spaceId: string) =>
    queryOptions({
      queryKey: [...plansQueries.active(), spaceId] as const,
      queryFn: (): Promise<PlanWithDerived | null> =>
        getActivePlanForSpaceUi(spaceId),
      staleTime: 10_000,
      gcTime: 60_000,
    }),

  detailPage: (spaceId: string, planId: string) =>
    queryOptions({
      queryKey: [...plansQueries.pages(), "detail", spaceId, planId] as const,
      queryFn: async (): Promise<PlanDetailData> => {
        const [space, plan] = await Promise.all([
          getSpaceForUi(spaceId),
          getPlanForUi(planId),
        ]);
        if (plan.spaceId !== spaceId) {
          throw new Response("Not Found", { status: 404 });
        }

        const nextQueue = plan.modules
          .flatMap((m) => m.sessions)
          .filter((session) => session.status !== "completed")
          .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate))
          .slice(0, 3)
          .map((session) => ({
            href: `/session?sessionId=${encodeURIComponent(session.id)}`,
          }));

        return {
          space: { id: space.id, name: space.name },
          plan,
          nextQueue,
          sourceMaterials: [],
        };
      },
      staleTime: 5_000,
      gcTime: 60_000,
    }),
};
