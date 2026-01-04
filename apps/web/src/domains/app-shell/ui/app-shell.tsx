import { SidebarInset, SidebarProvider, useSidebar } from "@repo/ui/sidebar";
import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";

import { useAppShellState } from "../application/use-app-shell-state";
import { useCommandActions } from "../application/use-command-actions";

import { AppCommandPalette } from "./app-command-palette";
import { AppSidebar } from "./app-sidebar";
import { SettingsDialog } from "./settings-dialog";

import type { AppShellData } from "../model/types";

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

export function AppShell({ user, spaces }: AppShellData) {
  const navigate = useNavigate();
  const state = useAppShellState();

  const actions = useCommandActions({
    navigate,
    openSettings: () => state.setSettingsOpen(true),
  });

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
        onOpenCommandPalette={() => state.setCommandOpen(true)}
      />
      <SidebarInset>
        <main className="mx-auto w-full">
          <Outlet />
        </main>
      </SidebarInset>

      <AppCommandPalette
        open={state.commandOpen}
        onOpenChange={state.setCommandOpen}
        actions={actions}
      />

      <SettingsDialog
        open={state.settingsOpen}
        onOpenChange={state.setSettingsOpen}
      />
    </SidebarProvider>
  );
}
