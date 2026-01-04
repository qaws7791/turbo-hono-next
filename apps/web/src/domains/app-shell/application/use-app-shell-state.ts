import * as React from "react";

import { useHotkeys } from "~/foundation/hooks/use-hotkeys";

export type AppShellState = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  commandOpen: boolean;
  setCommandOpen: (open: boolean) => void;
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
};

export function useAppShellState(): AppShellState {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [commandOpen, setCommandOpen] = React.useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  useHotkeys([
    {
      key: "k",
      meta: true,
      handler: () => setCommandOpen(true),
    },
    {
      key: "k",
      ctrl: true,
      handler: () => setCommandOpen(true),
    },
    {
      key: ",",
      meta: true,
      handler: () => setSettingsOpen(true),
    },
    {
      key: ",",
      ctrl: true,
      handler: () => setSettingsOpen(true),
    },
  ]);

  return {
    sidebarOpen,
    setSidebarOpen,
    commandOpen,
    setCommandOpen,
    settingsOpen,
    setSettingsOpen,
  };
}
