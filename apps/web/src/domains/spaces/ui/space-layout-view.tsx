import { TabNav, TabNavLink } from "@repo/ui/tab-nav";
import { IconBook, IconFileDescription, IconSchool } from "@tabler/icons-react";
import * as React from "react";
import { NavLink, Outlet, useFetcher } from "react-router";

import type { Space } from "~/app/mocks/schemas";
import type { SpaceLayoutModel } from "../application/use-space-layout-model";

import { PageBody, PageHeader } from "~/domains/app-shell";
import { IconColorPicker } from "~/domains/spaces/ui/icon-color-picker";

export function SpaceLayoutView({
  space,
  model,
}: {
  space: Space;
  model: SpaceLayoutModel;
}) {
  const fetcher = useFetcher();

  // 아이콘/색상 선택 상태
  const [selectedIcon, setSelectedIcon] = React.useState(space.icon ?? "book");
  const [selectedColor, setSelectedColor] = React.useState(
    space.color ?? "blue",
  );

  // 아이콘/색상이 변경되면 자동 저장
  React.useEffect(() => {
    if (selectedIcon !== space.icon || selectedColor !== space.color) {
      fetcher.submit(
        {
          intent: "update-space",
          spaceId: space.id,
          icon: selectedIcon,
          color: selectedColor,
        },
        { method: "post" },
      );
    }
  }, [selectedIcon, selectedColor, fetcher, space.color, space.icon, space.id]);

  return (
    <>
      <PageHeader>
        <div className="flex flex-1 items-center gap-2">
          <IconColorPicker
            selectedIcon={selectedIcon}
            selectedColor={selectedColor}
            onIconChange={setSelectedIcon}
            onColorChange={setSelectedColor}
          />
          <div className="min-w-0">
            <h1 className="text-foreground text-lg truncate">{space.name}</h1>
          </div>
        </div>
      </PageHeader>
      <PageBody className="space-y-8 mt-24 max-w-4xl">
        <div className="flex flex-1 items-center gap-2">
          <IconColorPicker
            selectedIcon={selectedIcon}
            selectedColor={selectedColor}
            onIconChange={setSelectedIcon}
            onColorChange={setSelectedColor}
          />
          <div className="min-w-0">
            <p className="text-foreground text-2xl font-semibold truncate">
              {space.name}
            </p>
          </div>
        </div>
        <TabNav>
          <TabNavLink
            render={<NavLink to={model.basePath} />}
            active={model.isPlans}
          >
            <IconSchool />
            학습 계획
          </TabNavLink>
          <TabNavLink
            render={<NavLink to={`${model.basePath}/materials`} />}
            active={model.isMaterials}
          >
            <IconFileDescription />
            학습 자료
          </TabNavLink>
          <TabNavLink
            render={<NavLink to={`${model.basePath}/concepts`} />}
            active={model.isConcepts}
          >
            <IconBook />
            개념
          </TabNavLink>
        </TabNav>

        <Outlet />
      </PageBody>
    </>
  );
}
