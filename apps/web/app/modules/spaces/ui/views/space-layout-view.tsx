import { TabNav, TabNavLink } from "@repo/ui/tab-nav";
import { IconBook, IconFileDescription, IconSchool } from "@tabler/icons-react";
import { NavLink, Outlet, useLocation } from "react-router";

import { useSpaceAppearance } from "../../application";
import { IconColorPicker } from "../components/icon-color-picker";

import type { SpaceDetail } from "../../domain";

import { PageBody, PageHeader } from "~/modules/app-shell";

export function SpaceLayoutView({ space }: { space: SpaceDetail }) {
  const location = useLocation();

  // 탭 상태 계산
  const basePath = `/spaces/${space.id}`;
  const pathname = location.pathname;
  const isDocuments = pathname.startsWith(`${basePath}/documents`);
  const isPlans =
    pathname === basePath ||
    pathname.startsWith(`${basePath}/plans`) ||
    pathname.startsWith(`${basePath}/plan/`);
  const isConcepts = pathname.startsWith(`${basePath}/concepts`);

  // 아이콘/색상 선택 상태
  const {
    selectedIcon,
    selectedColor,
    handleIconChange,
    handleColorChange,
    saveAppearance,
  } = useSpaceAppearance(space);

  return (
    <>
      <PageHeader>
        <div className="flex flex-1 items-center gap-2">
          <IconColorPicker
            selectedIcon={selectedIcon}
            selectedColor={selectedColor}
            onIconChange={handleIconChange}
            onColorChange={handleColorChange}
            onClose={saveAppearance}
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
            onIconChange={handleIconChange}
            onColorChange={handleColorChange}
            onClose={saveAppearance}
          />
          <div className="min-w-0">
            <p className="text-foreground text-2xl font-semibold truncate">
              {space.name}
            </p>
          </div>
        </div>
        <TabNav>
          <TabNavLink
            render={<NavLink to={basePath} />}
            active={isPlans}
          >
            <IconSchool />
            학습 계획
          </TabNavLink>
          <TabNavLink
            render={<NavLink to={`${basePath}/documents`} />}
            active={isDocuments}
          >
            <IconFileDescription />
            문서
          </TabNavLink>
          <TabNavLink
            render={<NavLink to={`${basePath}/concepts`} />}
            active={isConcepts}
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
