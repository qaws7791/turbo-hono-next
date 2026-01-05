import { queryOptions } from "@tanstack/react-query";

import { getPlan, listSpacePlans } from "./api";

import type { PlanDetailData, PlanWithDerived } from "./model/types";

import { getSpace } from "~/domains/spaces/api/spaces.api";

export const plansQueries = {
  all: () => ["plans"] as const,
  lists: () => [...plansQueries.all(), "list"] as const,
  details: () => [...plansQueries.all(), "detail"] as const,
  active: () => [...plansQueries.all(), "active"] as const,
  pages: () => [...plansQueries.all(), "page"] as const,

  listForSpace: (spaceId: string) =>
    queryOptions({
      queryKey: [...plansQueries.lists(), spaceId] as const,
      queryFn: async (): Promise<Array<PlanWithDerived>> => {
        const { data } = await listSpacePlans(spaceId);
        return data;
      },
      staleTime: 10_000,
      gcTime: 60_000,
    }),

  detail: (planId: string) =>
    queryOptions({
      queryKey: [...plansQueries.details(), planId] as const,
      queryFn: (): Promise<PlanWithDerived> => getPlan(planId),
      staleTime: 5_000,
      gcTime: 60_000,
    }),

  activeForSpace: (spaceId: string) =>
    queryOptions({
      queryKey: [...plansQueries.active(), spaceId] as const,
      queryFn: async (): Promise<PlanWithDerived | null> => {
        const { data } = await listSpacePlans(spaceId, {
          status: "ACTIVE",
          limit: 1,
        });
        return data[0] ?? null;
      },
      staleTime: 10_000,
      gcTime: 60_000,
    }),

  detailPage: (spaceId: string, planId: string) =>
    queryOptions({
      queryKey: [...plansQueries.pages(), "detail", spaceId, planId] as const,
      queryFn: async (): Promise<PlanDetailData> => {
        const [space, plan] = await Promise.all([
          getSpace(spaceId),
          getPlan(planId),
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
