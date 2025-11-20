import { createRouter } from "@tanstack/react-router";

import type { QueryClient } from "@tanstack/react-query";
import type { AuthState } from "@/features/auth/hooks/use-auth";

import { routeTree } from "@/routeTree.gen";

export interface RouterContext {
  queryClient: QueryClient;
  auth: AuthState;
}

export function createRouterContext(queryClient: QueryClient): RouterContext {
  return {
    queryClient,
    auth: undefined as unknown as AuthState,
  };
}

export function createAppRouter(context: RouterContext) {
  return createRouter({
    routeTree,
    context,
    defaultPreload: "intent",
    scrollRestoration: true,
    defaultStructuralSharing: true,
    defaultPreloadStaleTime: 0,
  });
}

export type AppRouter = ReturnType<typeof createAppRouter>;

declare module "@tanstack/react-router" {
  interface Register {
    router: AppRouter;
  }
}
