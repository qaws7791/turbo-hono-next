import { Button } from "@repo/ui/button";
import { IconBook, IconFileDescription, IconSchool } from "@tabler/icons-react";
import * as React from "react";
import { NavLink, Outlet, useFetcher } from "react-router";

import type { Space } from "~/mock/schemas";
import type { SpaceLayoutModel } from "./use-space-layout-model";

import { PageBody } from "~/features/app-shell/page-body";
import { PageHeader } from "~/features/app-shell/page-header";
import { IconColorPicker } from "~/features/spaces/icon-color-picker";

function TabLink({
  to,
  label,
  isActive,
  icon,
}: {
  to: string;
  label: string;
  isActive: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <Button
      variant={isActive ? "secondary" : "outline"}
      size="sm"
      className="justify-start"
      render={<NavLink to={to} />}
    >
      {icon}
      {label}
    </Button>
  );
}

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
        <div className="flex flex-wrap items-center gap-2">
          <TabLink
            to={model.basePath}
            label="학습 계획"
            isActive={model.isPlans}
            icon={<IconSchool />}
          />
          <TabLink
            to={`${model.basePath}/documents`}
            label="문서"
            isActive={model.isDocuments}
            icon={<IconFileDescription />}
          />
          <TabLink
            to={`${model.basePath}/concepts`}
            label="개념"
            isActive={model.isConcepts}
            icon={<IconBook />}
          />
        </div>

        <Outlet />
      </PageBody>
    </>
  );
}
