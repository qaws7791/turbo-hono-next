import { queryOptions } from "@tanstack/react-query";

import { getPlan, listSpacePlans } from "./api";

import type { PlanWithDerived } from "./model/types";

export const plansQueries = {
  all: () => ["plans"] as const,
  lists: () => [...plansQueries.all(), "list"] as const,
  details: () => [...plansQueries.all(), "detail"] as const,
  active: () => [...plansQueries.all(), "active"] as const,

  listForSpace: (spaceId: string) =>
    queryOptions({
      queryKey: [...plansQueries.lists(), spaceId] as const,
      queryFn: async (): Promise<Array<PlanWithDerived>> => {
        const { data } = await listSpacePlans(spaceId);
        return data;
      },
    }),

  detail: (planId: string) =>
    queryOptions({
      queryKey: [...plansQueries.details(), planId] as const,
      queryFn: (): Promise<PlanWithDerived> => getPlan(planId),
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
    }),
};
