import { SidebarInset, SidebarProvider, useSidebar } from "@repo/ui/sidebar";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Outlet, useLocation } from "react-router";

import { useAppShellState } from "../application/use-app-shell-state";

import { AppSidebar } from "./app-sidebar";
import { SettingsDialog } from "./settings-dialog";

import { useUser } from "~/domains/auth";
import { spacesQueries } from "~/domains/spaces";

/**
 * 라우트 변경 시 모바일 사이드바를 자동으로 닫는 컴포넌트
 * SidebarProvider 내부에서 사용해야 useSidebar 훅에 접근 가능
 */
function MobileSidebarAutoClose() {
  const location = useLocation();
  const { setOpenMobile } = useSidebar();

  useEffect(() => {
    setOpenMobile(false);
  }, [location.pathname, setOpenMobile]);

  return null;
}

export function AppShell() {
  const user = useUser();
  const { data: spaces } = useSuspenseQuery(spacesQueries.list());

  const state = useAppShellState();

  return (
    <SidebarProvider
      open={state.sidebarOpen}
      onOpenChange={state.setSidebarOpen}
    >
      <MobileSidebarAutoClose />
      <AppSidebar
        user={user}
        spaces={spaces}
        onOpenSettings={() => state.setSettingsOpen(true)}
      />
      <SidebarInset>
        <main className="mx-auto w-full">
          <Outlet />
        </main>
      </SidebarInset>

      <SettingsDialog
        open={state.settingsOpen}
        onOpenChange={state.setSettingsOpen}
      />
    </SidebarProvider>
  );
}
