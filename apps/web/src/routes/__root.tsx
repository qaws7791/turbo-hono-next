import { TanstackDevtools } from "@tanstack/react-devtools";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";

import type { AuthState } from "@/domains/auth/use-auth";
import type { QueryClient } from "@tanstack/react-query";
import { NuqsAdapter } from "nuqs/adapters/tanstack-router";

interface MyRouterContext {
  queryClient: QueryClient;
  auth: AuthState;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      <NuqsAdapter>
        <Outlet />
      </NuqsAdapter>
      <TanstackDevtools
        config={{
          position: "bottom-left",
        }}
        plugins={[
          {
            name: "Tanstack Router",
            render: <TanStackRouterDevtoolsPanel />,
          },
          TanStackQueryDevtools,
        ]}
      />
    </>
  ),
});
