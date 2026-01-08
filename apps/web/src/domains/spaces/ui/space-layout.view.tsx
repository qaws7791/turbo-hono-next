import { TabNav, TabNavLink } from "@repo/ui/tab-nav";
import { IconFileDescription, IconSchool } from "@tabler/icons-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { NavLink, Outlet, useOutlet } from "react-router";

import { useSpaceTabs } from "../application";
import { spacesQueries } from "../spaces.queries";

import { SpaceIconEditor } from "./space-icon-editor";
import { SpacePlansView } from "./space-plans.view";

import { PageBody, PageHeader } from "~/domains/app-shell";
import { SpaceMaterialsView } from "~/domains/materials";

export function SpaceLayoutView({ spaceId }: { spaceId: string }) {
  const { tab } = useSpaceTabs();
  const outlet = useOutlet();

  const { data: space } = useSuspenseQuery(spacesQueries.detail(spaceId));

  return (
    <>
      <PageHeader>
        <div className="flex flex-1 items-center gap-2">
          <SpaceIconEditor spaceId={spaceId} />
          <div className="min-w-0">
            <h1 className="text-foreground text-lg truncate">{space.name}</h1>
          </div>
        </div>
      </PageHeader>
      <PageBody className="space-y-8 mt-24 max-w-4xl">
        {outlet ? (
          <Outlet />
        ) : (
          <>
            <div className="flex flex-1 items-center gap-2">
              <SpaceIconEditor spaceId={spaceId} />
              <div className="min-w-0">
                <p className="text-foreground text-2xl font-semibold truncate">
                  {space.name}
                </p>
              </div>
            </div>
            <TabNav>
              <TabNavLink
                render={<NavLink to="?tab=plans" />}
                active={tab === "plans"}
              >
                <IconSchool />
                학습 계획
              </TabNavLink>
              <TabNavLink
                render={<NavLink to="?tab=materials" />}
                active={tab === "materials"}
              >
                <IconFileDescription />
                학습 자료
              </TabNavLink>
            </TabNav>

            {tab === "plans" && <SpacePlansView spaceId={spaceId} />}
            {tab === "materials" && <SpaceMaterialsView spaceId={spaceId} />}
          </>
        )}
      </PageBody>
    </>
  );
}
