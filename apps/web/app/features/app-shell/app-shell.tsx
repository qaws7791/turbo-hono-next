import { SidebarInset, SidebarProvider } from "@repo/ui/sidebar";
import { Outlet, useNavigate } from "react-router";

import { SettingsDialog } from "../settings/settings-dialog";

import { AppCommandPalette } from "./app-command-palette";
import { AppSidebar } from "./app-sidebar";
import { useAppShellState } from "./use-app-shell-state";
import { useCommandActions } from "./use-command-actions";

import type { AppShellData } from "./types";

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
