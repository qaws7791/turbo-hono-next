import * as React from "react";

import type { NavigateFunction } from "react-router";
import type { CommandAction } from "./types";

export function useCommandActions(input: {
  navigate: NavigateFunction;
  openSettings: () => void;
}): Array<CommandAction> {
  return React.useMemo(
    () => [
      {
        group: "Navigate",
        label: "Home",
        shortcut: "G H",
        run: () => input.navigate("/home"),
      },
      {
        group: "Navigate",
        label: "Spaces",
        shortcut: "G S",
        run: () => input.navigate("/spaces"),
      },
      {
        group: "Navigate",
        label: "Concept Library",
        shortcut: "G C",
        run: () => input.navigate("/concepts"),
      },
      {
        group: "Actions",
        label: "Settings",
        shortcut: "⌘ ,",
        run: input.openSettings,
      },
    ],
    [input],
  );
}

