import { TanstackDevtools } from "@tanstack/react-devtools";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { NuqsAdapter } from "nuqs/adapters/tanstack-router";

import type { RouterContext as AppRouterContext } from "@/app/router";

import TanStackQueryDevtools from "@/app/devtools/query-devtools";

export const Route = createRootRouteWithContext<AppRouterContext>()({
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
