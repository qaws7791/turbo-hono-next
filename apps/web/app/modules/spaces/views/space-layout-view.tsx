import { TabNav, TabNavLink } from "@repo/ui/tab-nav";
import { IconBook, IconFileDescription, IconSchool } from "@tabler/icons-react";
import * as React from "react";
import { NavLink, Outlet } from "react-router";

import { PageBody, PageHeader } from "~/modules/app-shell";
import { useUpdateSpaceMutation } from "~/modules/spaces";
import { IconColorPicker } from "../components/icon-color-picker";

import type { SpaceDetail } from "~/modules/spaces";
import type { SpaceLayoutModel } from "../models/use-space-layout-model";

export function SpaceLayoutView({
  space,
  model,
}: {
  space: SpaceDetail;
  model: SpaceLayoutModel;
}) {
  const updateSpace = useUpdateSpaceMutation();

  // 아이콘/색상 선택 상태
  const initialIcon = space.icon ?? "book";
  const initialColor = space.color ?? "blue";

  const [selectedIcon, setSelectedIcon] = React.useState(initialIcon);
  const [selectedColor, setSelectedColor] = React.useState(initialColor);

  React.useEffect(() => {
    setSelectedIcon(initialIcon);
    setSelectedColor(initialColor);
  }, [initialColor, initialIcon, space.id]);

  // 아이콘/색상이 변경되면 자동 저장
  React.useEffect(() => {
    if (selectedIcon === initialIcon && selectedColor === initialColor) return;

    updateSpace.mutate({
      spaceId: space.id,
      body: {
        icon: selectedIcon,
        color: selectedColor,
      },
    });
  }, [
    initialColor,
    initialIcon,
    selectedColor,
    selectedIcon,
    space.id,
    updateSpace,
  ]);

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
            render={<NavLink to={`${model.basePath}/documents`} />}
            active={model.isDocuments}
          >
            <IconFileDescription />
            문서
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
