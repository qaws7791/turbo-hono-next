import { queryOptions } from "@tanstack/react-query";

import { getPlan, listPlans } from "./api";

import type { PlanWithDerived } from "./model/types";

export const plansQueries = {
  all: () => ["plans"] as const,
  lists: () => [...plansQueries.all(), "list"] as const,
  details: () => [...plansQueries.all(), "detail"] as const,
  active: () => [...plansQueries.all(), "active"] as const,

  list: (query?: { status?: "ACTIVE" | "PAUSED" | "ARCHIVED" | "COMPLETED" }) =>
    queryOptions({
      queryKey: [...plansQueries.lists(), query] as const,
      queryFn: async (): Promise<Array<PlanWithDerived>> => {
        const { data } = await listPlans(query);
        return data;
      },
    }),

  detail: (planId: string) =>
    queryOptions({
      queryKey: [...plansQueries.details(), planId] as const,
      queryFn: (): Promise<PlanWithDerived> => getPlan(planId),
    }),

  activePlan: () =>
    queryOptions({
      queryKey: [...plansQueries.active()] as const,
      queryFn: async (): Promise<PlanWithDerived | null> => {
        const { data } = await listPlans({ status: "ACTIVE" });
        return data[0] ?? null;
      },
    }),
};
